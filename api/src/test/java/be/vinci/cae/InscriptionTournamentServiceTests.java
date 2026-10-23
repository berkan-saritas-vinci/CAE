package be.vinci.cae;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.cae.dto.TeamTournamentRegistrationDto;
import be.vinci.cae.models.InscriptionTournament;
import be.vinci.cae.models.Notification;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.Tournament;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.InscriptionTournamentRepository;
import be.vinci.cae.repositories.TeamRepository;
import be.vinci.cae.repositories.TournamentRepository;
import be.vinci.cae.services.InscriptionTournamentService;
import be.vinci.cae.services.NotificationService;
import be.vinci.cae.services.NotificationUserService;
import be.vinci.cae.services.UserService;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

public class InscriptionTournamentServiceTests {

  private InscriptionTournamentRepository inscriptionTournamentRepository;
  private TeamRepository teamRepository;
  private TournamentRepository tournamentRepository;
  private UserService userService;
  private NotificationService notificationService;
  private NotificationUserService notificationUserService;

  private InscriptionTournamentService inscriptionTournamentService;

  @BeforeEach
  void setUp() {
    inscriptionTournamentRepository =
        org.mockito.Mockito.mock(InscriptionTournamentRepository.class);
    teamRepository = org.mockito.Mockito.mock(TeamRepository.class);
    tournamentRepository = org.mockito.Mockito.mock(TournamentRepository.class);
    userService = org.mockito.Mockito.mock(UserService.class);
    notificationService = org.mockito.Mockito.mock(NotificationService.class);
    notificationUserService = org.mockito.Mockito.mock(NotificationUserService.class);

    inscriptionTournamentService = new InscriptionTournamentService(
        inscriptionTournamentRepository,
        teamRepository,
        tournamentRepository,
        userService,
        notificationService,
        notificationUserService
    );
  }

  @Test
  void createInscription_shouldReturnNull_whenInputIsInvalid() {
    InscriptionTournament result = inscriptionTournamentService.createInscription(null);

    assertNull(result);
  }

  @Test
  void createInscription_shouldReturnNull_whenTeamDoesNotExist() {
    InscriptionTournament input = new InscriptionTournament();
    Team team = org.mockito.Mockito.mock(Team.class);
    when(team.getId()).thenReturn(1L);
    Tournament tournament = new Tournament();
    tournament.setId(2L);
    input.setTeam(team);
    input.setTournament(tournament);

    when(teamRepository.findById(1L)).thenReturn(Optional.empty());

    InscriptionTournament result = inscriptionTournamentService.createInscription(input);

    assertNull(result);
  }

  @Test
  void createInscription_shouldReturnNull_whenTournamentDoesNotExist() {
    InscriptionTournament input = new InscriptionTournament();
    Team team = org.mockito.Mockito.mock(Team.class);
    when(team.getId()).thenReturn(1L);
    Tournament tournament = new Tournament();
    tournament.setId(2L);
    input.setTeam(team);
    input.setTournament(tournament);

    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(tournamentRepository.findById(2L)).thenReturn(Optional.empty());

    InscriptionTournament result = inscriptionTournamentService.createInscription(input);

    assertNull(result);
  }

  @Test
  void createInscription_shouldReturnNull_whenAlreadyRegistered() {
    InscriptionTournament input = new InscriptionTournament();
    Team team = org.mockito.Mockito.mock(Team.class);
    when(team.getId()).thenReturn(1L);
    Tournament tournament = new Tournament();
    tournament.setId(2L);
    input.setTeam(team);
    input.setTournament(tournament);

    when(teamRepository.findById(1L)).thenReturn(Optional.of(team));
    when(tournamentRepository.findById(2L)).thenReturn(Optional.of(tournament));
    when(inscriptionTournamentRepository.existsByTeamIdAndTournamentId(1L, 2L))
        .thenReturn(true);

    InscriptionTournament result = inscriptionTournamentService.createInscription(input);

    assertNull(result);
  }

  @Test
  void createInscription_shouldSaveAndNotifyMembers() {
    Team team = org.mockito.Mockito.mock(Team.class);
    when(team.getId()).thenReturn(11L);

    Tournament tournament = new Tournament();
    tournament.setId(22L);
    tournament.setNom("Spring Cup");
    tournament.setNbrTeamInscrite(3L);

    InscriptionTournament input = new InscriptionTournament();
    input.setTeam(team);
    input.setTournament(tournament);

    User u1 = new User();
    u1.setId(1L);
    User u2 = new User();
    u2.setId(2L);

    Notification createdNotification = new Notification();
    createdNotification.setId(100L);

    when(teamRepository.findById(11L)).thenReturn(Optional.of(team));
    when(tournamentRepository.findById(22L)).thenReturn(Optional.of(tournament));
    when(inscriptionTournamentRepository.existsByTeamIdAndTournamentId(11L, 22L))
        .thenReturn(false);
    when(userService.getUsersByTeam(11L)).thenReturn(Arrays.asList(u1, u2));
    when(notificationService.createNotification(any())).thenReturn(createdNotification);
    when(inscriptionTournamentRepository.save(any(InscriptionTournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    InscriptionTournament result = inscriptionTournamentService.createInscription(input);

    assertEquals(4L, tournament.getNbrTeamInscrite());
    assertSame(team, result.getTeam());
    assertSame(tournament, result.getTournament());

    verify(inscriptionTournamentRepository).save(any(InscriptionTournament.class));
    verify(notificationService, times(2)).createNotification(any());
    verify(notificationUserService, times(2)).createNotificationUser(any());
  }

  @Test
  void registerTeamToTournament_shouldReturnNull_whenDtoIsInvalid() {
    InscriptionTournament result = inscriptionTournamentService.registerTeamToTournament(null);

    assertNull(result);
  }

  @Test
  void registerTeamToTournament_shouldReturnNull_whenTeamDoesNotExist() {
    TeamTournamentRegistrationDto dto = new TeamTournamentRegistrationDto(10L, 20L, 100L);

    when(teamRepository.findById(10L)).thenReturn(Optional.empty());

    InscriptionTournament result = inscriptionTournamentService.registerTeamToTournament(dto);

    assertNull(result);
  }

  @Test
  void registerTeamToTournament_shouldReturnNull_whenUserIsNotResponsable() {
    Team team = org.mockito.Mockito.mock(Team.class);
    when(team.getId()).thenReturn(10L);
    when(team.getResponsable()).thenReturn(999L);

    TeamTournamentRegistrationDto dto = new TeamTournamentRegistrationDto(10L, 20L, 100L);

    when(teamRepository.findById(10L)).thenReturn(Optional.of(team));

    InscriptionTournament result = inscriptionTournamentService.registerTeamToTournament(dto);

    assertNull(result);
  }

  @Test
  void registerTeamToTournament_shouldSaveAndNotify_whenUserIsResponsable() {
    Team team = org.mockito.Mockito.mock(Team.class);
    when(team.getId()).thenReturn(10L);
    when(team.getResponsable()).thenReturn(100L);

    Tournament tournament = new Tournament();
    tournament.setId(20L);
    tournament.setNom("Summer Cup");
    tournament.setNbrTeamInscrite(0L);

    TeamTournamentRegistrationDto dto = new TeamTournamentRegistrationDto(10L, 20L, 100L);

    User u1 = new User();
    u1.setId(1L);

    Notification createdNotification = new Notification();
    createdNotification.setId(777L);

    when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
    when(tournamentRepository.findById(20L)).thenReturn(Optional.of(tournament));
    when(inscriptionTournamentRepository.existsByTeamIdAndTournamentId(10L, 20L))
        .thenReturn(false);
    when(userService.getUsersByTeam(10L)).thenReturn(List.of(u1));
    when(notificationService.createNotification(any())).thenReturn(createdNotification);
    when(inscriptionTournamentRepository.save(any(InscriptionTournament.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    InscriptionTournament result = inscriptionTournamentService.registerTeamToTournament(dto);

    assertSame(team, result.getTeam());
    assertSame(tournament, result.getTournament());
    assertEquals(1L, tournament.getNbrTeamInscrite());

    ArgumentCaptor<InscriptionTournament> captor =
        ArgumentCaptor.forClass(InscriptionTournament.class);
    verify(inscriptionTournamentRepository).save(captor.capture());
    assertSame(team, captor.getValue().getTeam());
    assertSame(tournament, captor.getValue().getTournament());

    verify(notificationService, times(1)).createNotification(any());
    verify(notificationUserService, times(1)).createNotificationUser(any());
  }

  @Test
  void getInscriptionsByTeamId_shouldReturnRepositoryValue() {
    InscriptionTournament inscription = new InscriptionTournament();
    when(inscriptionTournamentRepository.findByTeamId(3L)).thenReturn(List.of(inscription));

    List<InscriptionTournament> result = inscriptionTournamentService.getInscriptionsByTeamId(3L);

    assertEquals(1, result.size());
    assertSame(inscription, result.get(0));
  }

  @Test
  void getTournamentRegistrationCounts_shouldMapRows() {
    Object[] row1 = new Object[] {1L, 2L};
    Object[] row2 = new Object[] {5L, 9L};
    when(inscriptionTournamentRepository.countGroupedByTournamentId())
        .thenReturn(List.of(row1, row2));

    var counts = inscriptionTournamentService.getTournamentRegistrationCounts();

    assertEquals(2L, counts.get(1L));
    assertEquals(9L, counts.get(5L));
  }

  @Test
  void getTeamsByTournamentId_shouldReturnMappedTeams() {
    Team team1 = new Team();
    Team team2 = new Team();

    InscriptionTournament i1 = new InscriptionTournament();
    i1.setTeam(team1);
    InscriptionTournament i2 = new InscriptionTournament();
    i2.setTeam(team2);

    when(inscriptionTournamentRepository.findByTournamentId(77L))
        .thenReturn(List.of(i1, i2));

    List<Team> result = inscriptionTournamentService.getTeamsByTournamentId(77L);

    assertEquals(2, result.size());
    assertSame(team1, result.get(0));
    assertSame(team2, result.get(1));
  }
}
