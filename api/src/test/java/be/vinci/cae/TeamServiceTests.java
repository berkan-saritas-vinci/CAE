package be.vinci.cae;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.cae.models.Team;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.TeamRepository;
import be.vinci.cae.repositories.UserRepository;
import be.vinci.cae.services.TeamService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class TeamServiceTests {

  private TeamRepository teamRepository;
  private UserRepository userRepository;
  private TeamService teamService;

  @BeforeEach
  void setUp() {
    teamRepository = org.mockito.Mockito.mock(TeamRepository.class);
    userRepository = org.mockito.Mockito.mock(UserRepository.class);
    teamService = new TeamService(teamRepository, userRepository);
  }

  @Test
  void getAllTeams_shouldReturnRepositoryValue() {
    Team t1 = new Team();
    Team t2 = new Team();
    when(teamRepository.findAll()).thenReturn(List.of(t1, t2));

    List<Team> result = teamService.getAllTeams();

    assertEquals(2, result.size());
    assertSame(t1, result.get(0));
    assertSame(t2, result.get(1));
  }

  @Test
  void getById_shouldReturnRepositoryValue() {
    Team team = new Team();
    when(teamRepository.findById(12L)).thenReturn(Optional.of(team));

    Optional<Team> result = teamService.getById(12L);

    assertTrue(result.isPresent());
    assertSame(team, result.get());
  }

  @Test
  void getByName_shouldReturnRepositoryValue() {
    Team team = new Team();
    when(teamRepository.findByName("Lions")).thenReturn(Optional.of(team));

    Optional<Team> result = teamService.getByName("Lions");

    assertTrue(result.isPresent());
    assertSame(team, result.get());
  }

  @Test
  void createTeam_shouldThrow_whenNameAlreadyExists() {
    Team team = new Team();
    team.setName("Lions");
    when(teamRepository.existsByName("Lions")).thenReturn(true);

    RuntimeException ex = assertThrows(RuntimeException.class, () -> teamService.createTeam(team));

    assertEquals("Team already exists", ex.getMessage());
    verify(teamRepository, never()).save(team);
  }

  @Test
  void createTeam_shouldSaveTeamAndAssignResponsable_whenUserExists() {
    Team team = new Team();
    team.setName("Lions");
    team.setResponsable(7L);

    User responsable = new User();
    responsable.setId(7L);

    when(teamRepository.existsByName("Lions")).thenReturn(false);
    when(userRepository.findById(7L)).thenReturn(responsable);

    Team result = teamService.createTeam(team);

    assertSame(team, result);
    assertSame(team, responsable.getTeam());
    verify(teamRepository).save(team);
    verify(userRepository).save(responsable);
  }

  @Test
  void createTeam_shouldSaveTeamWithoutAssigning_whenResponsableNotFound() {
    Team team = new Team();
    team.setName("Lions");
    team.setResponsable(7L);

    when(teamRepository.existsByName("Lions")).thenReturn(false);
    when(userRepository.findById(7L)).thenReturn(null);

    Team result = teamService.createTeam(team);

    assertSame(team, result);
    verify(teamRepository).save(team);
    verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any(User.class));
  }

  @Test
  void getTeamMembers_shouldReturnRepositoryValue() {
    User u1 = new User();
    User u2 = new User();
    when(userRepository.findByTeamId(3L)).thenReturn(List.of(u1, u2));

    List<User> result = teamService.getTeamMembers(3L);

    assertEquals(2, result.size());
    assertSame(u1, result.get(0));
    assertSame(u2, result.get(1));
  }

  @Test
  void getTeamByUserId_shouldReturnNull_whenUserNotFound() {
    when(userRepository.findById(5L)).thenReturn(null);

    Team result = teamService.getTeamByUserId(5L);

    assertNull(result);
  }

  @Test
  void getTeamByUserId_shouldReturnUserTeam_whenUserFound() {
    Team team = new Team();
    User user = new User();
    user.setTeam(team);
    when(userRepository.findById(5L)).thenReturn(user);

    Team result = teamService.getTeamByUserId(5L);

    assertSame(team, result);
  }

  @Test
  void quitTeam_shouldReturnImmediately_whenUserNotFound() {
    when(userRepository.findById(10L)).thenReturn(null);

    teamService.quitTeam(10L);

    verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any(User.class));
    verify(teamRepository, never()).save(org.mockito.ArgumentMatchers.any(Team.class));
  }

  @Test
  void quitTeam_shouldOnlyClearUserTeam_whenUserHasNoTeam() {
    User user = new User();
    user.setId(15L);
    user.setTeam(null);
    when(userRepository.findById(15L)).thenReturn(user);

    teamService.quitTeam(15L);

    assertNull(user.getTeam());
    verify(userRepository).save(user);
    verify(teamRepository, never()).save(org.mockito.ArgumentMatchers.any(Team.class));
  }

  @Test
  void quitTeam_shouldPromoteFirstMember_whenUserIsResponsable() {
    Team team = org.mockito.Mockito.mock(Team.class);
    when(team.getId()).thenReturn(20L);
    when(team.getResponsable()).thenReturn(4L);

    User userLeaving = new User();
    userLeaving.setId(4L);
    userLeaving.setTeam(team);

    User newResponsable = new User();
    newResponsable.setId(8L);

    when(userRepository.findById(4L)).thenReturn(userLeaving);
    when(userRepository.findByTeamId(20L)).thenReturn(List.of(newResponsable));

    teamService.quitTeam(4L);

    assertNull(userLeaving.getTeam());
    verify(userRepository).save(userLeaving);
    verify(team).setResponsable(8L);
    verify(teamRepository).save(team);
  }

  @Test
  void quitTeam_shouldNotPromote_whenNoMembersLeft() {
    Team team = org.mockito.Mockito.mock(Team.class);
    when(team.getId()).thenReturn(20L);
    when(team.getResponsable()).thenReturn(4L);

    User userLeaving = new User();
    userLeaving.setId(4L);
    userLeaving.setTeam(team);

    when(userRepository.findById(4L)).thenReturn(userLeaving);
    when(userRepository.findByTeamId(20L)).thenReturn(List.of());

    teamService.quitTeam(4L);

    assertNull(userLeaving.getTeam());
    verify(userRepository).save(userLeaving);
    verify(teamRepository, never()).save(team);
  }

  @Test
  void quitTeam_shouldNotPromote_whenUserIsNotResponsable() {
    Team team = org.mockito.Mockito.mock(Team.class);
    when(team.getId()).thenReturn(20L);
    when(team.getResponsable()).thenReturn(99L);

    User userLeaving = new User();
    userLeaving.setId(4L);
    userLeaving.setTeam(team);

    when(userRepository.findById(4L)).thenReturn(userLeaving);

    teamService.quitTeam(4L);

    assertNull(userLeaving.getTeam());
    verify(userRepository).save(userLeaving);
    verify(userRepository, never()).findByTeamId(20L);
    verify(teamRepository, never()).save(team);
  }

  @Test
  void getTeamsWithMembers_shouldFilterTeamsWithoutMembers() {
    Team t1 = org.mockito.Mockito.mock(Team.class);
    when(t1.getId()).thenReturn(1L);
    Team t2 = org.mockito.Mockito.mock(Team.class);
    when(t2.getId()).thenReturn(2L);

    when(teamRepository.findAll()).thenReturn(List.of(t1, t2));
    when(userRepository.findByTeamId(1L)).thenReturn(List.of(new User()));
    when(userRepository.findByTeamId(2L)).thenReturn(List.of());

    List<Team> result = teamService.getTeamsWithMembers();

    assertEquals(1, result.size());
    assertSame(t1, result.get(0));
  }

  @Test
  void setSecondResponsable_shouldThrow_whenTeamNotFound() {
    when(teamRepository.findById(50L)).thenReturn(Optional.empty());

    RuntimeException ex = assertThrows(
        RuntimeException.class,
        () -> teamService.setSecondResponsable(50L, 12L)
    );

    assertEquals("Team not found", ex.getMessage());
  }

  @Test
  void setSecondResponsable_shouldUpdateAndSaveTeam() {
    Team team = new Team();

    when(teamRepository.findById(50L)).thenReturn(Optional.of(team));
    when(teamRepository.save(team)).thenReturn(team);

    Team result = teamService.setSecondResponsable(50L, 12L);

    assertSame(team, result);
    assertEquals(12L, result.getSecondResponsable());
    verify(teamRepository, times(1)).save(team);
  }
}
