package be.vinci.cae;

import be.vinci.cae.models.Tournament;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.TournamentRepository;
import be.vinci.cae.repositories.UserRepository;
import be.vinci.cae.services.NotificationService;
import be.vinci.cae.services.NotificationUserService;
import be.vinci.cae.services.TeamService;
import be.vinci.cae.services.TournamentService;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TournamentServiceTests {

	private TournamentRepository tournamentRepository;
  private TournamentService tournamentService;
	private UserRepository userRepository;
	private NotificationService notificationService;
	private NotificationUserService notificationUserService;
	private TeamService teamService;

  @BeforeEach
  void setUp() {

    tournamentRepository = Mockito.mock(TournamentRepository.class);
    tournamentService = Mockito.mock(TournamentService.class);
    userRepository = Mockito.mock(UserRepository.class);
    notificationService = Mockito.mock(NotificationService.class);
    notificationUserService = Mockito.mock(NotificationUserService.class);
    teamService = Mockito.mock(TeamService.class);

    tournamentService = new TournamentService(
      tournamentRepository,
      userRepository,
      notificationService,
      notificationUserService,
      teamService
    );
  }

	@Test
	void getAllTournament() {
		Tournament tournament = new Tournament();
		tournament.setId(1L);

		Mockito.when(tournamentRepository.findAll()).thenReturn(List.of(tournament));

		Iterable<Tournament> result = tournamentService.getAllTournament();

		assertNotNull(result);
		assertTrue(result.iterator().hasNext());
		Mockito.verify(tournamentRepository, times(1)).findAll();
	}

  @Test
  void getTournamentById() {
    Tournament tournament = new Tournament();
    tournament.setId(10L);

    Mockito.when(tournamentRepository.findById(10L))
      .thenReturn(java.util.Optional.of(tournament));

    var result = tournamentService.getTournamentById(10L);

    assertTrue(result.isPresent());
    assertEquals(10L, result.get().getId());
    Mockito.verify(tournamentRepository, times(1)).findById(10L);
  }

	@Test
  void addTournament() {
		Date startDate = new Date(1_000L);
		Date endDate = new Date(2_000L);
		Date registrationEndDate = new Date(1_500L);

		Tournament input = new Tournament();
		input.setNom("Spring Cup");
		input.setDescription("Friendly competition");
		input.setDateDebut(startDate);
		input.setDateFin(endDate);
		input.setDateFinInscription(registrationEndDate);
    input.setEtat("SAUVEGARDE");
		input.setNbrTeam(12L);

    User admin1 = new User();
    admin1.setId(1L);
    User admin2 = new User();
    admin2.setId(2L);

    be.vinci.cae.models.Notification notif = Mockito.mock(be.vinci.cae.models.Notification.class);

		Tournament persisted = new Tournament();
		persisted.setId(42L);
		persisted.setNom("Spring Cup");
		persisted.setDescription("Friendly competition");
		persisted.setDateDebut(startDate);
		persisted.setDateFin(endDate);
		persisted.setDateFinInscription(registrationEndDate);
    persisted.setEtat("SAUVEGARDE");
		persisted.setNbrTeam(12L);
    persisted.setNbrTeamInscrite(0L);

		// Mock the dependencies used in addTournament
    Mockito.when(userRepository.findByRole("ADMIN")).thenReturn(List.of(admin1, admin2));
    Mockito.when(notificationService.createNotification(any())).thenReturn(notif);
		Mockito.when(tournamentRepository.save(any(Tournament.class))).thenReturn(persisted);

		Tournament result = tournamentService.addTournament(input);
		ArgumentCaptor<Tournament> captor = ArgumentCaptor.forClass(Tournament.class);
    ArgumentCaptor<be.vinci.cae.dto.NewNotification> notificationCaptor =
      ArgumentCaptor.forClass(be.vinci.cae.dto.NewNotification.class);

		Mockito.verify(tournamentRepository).save(captor.capture());
    verify(notificationService, times(2)).createNotification(notificationCaptor.capture());
    verify(notificationUserService, times(2)).createNotificationUser(any());
		Tournament saved = captor.getValue();

		assertNotNull(result);
		assertSame(persisted, result);
		assertEquals(input.getNom(), saved.getNom());
		assertEquals(input.getDescription(), saved.getDescription());
		assertEquals(input.getDateDebut(), saved.getDateDebut());
		assertEquals(input.getDateFin(), saved.getDateFin());
		assertEquals(input.getDateFinInscription(), saved.getDateFinInscription());
		assertEquals("SAUVEGARDE", saved.getEtat());
		assertEquals(input.getNbrTeam(), saved.getNbrTeam());
		assertEquals(0L, saved.getNbrTeamInscrite());
		notificationCaptor.getAllValues().forEach(n ->
			assertEquals("Un nouveau tournois est pret à être publié.", n.getMessage())
		);
	}

  @Test
  void addTournament_shouldUseErreurMessage_whenEtatIsNotSauvegarde() {
    Tournament input = new Tournament();
    input.setEtat("EN_COURS");
    input.setNom("Tournament X");

    User admin = new User();
    admin.setId(5L);

    be.vinci.cae.models.Notification notif = Mockito.mock(be.vinci.cae.models.Notification.class);
    Tournament persisted = new Tournament();

    when(userRepository.findByRole("ADMIN")).thenReturn(List.of(admin));
    when(notificationService.createNotification(any())).thenReturn(notif);
    when(tournamentRepository.save(any(Tournament.class))).thenReturn(persisted);

    tournamentService.addTournament(input);

    ArgumentCaptor<be.vinci.cae.dto.NewNotification> captor =
      ArgumentCaptor.forClass(be.vinci.cae.dto.NewNotification.class);
    verify(notificationService).createNotification(captor.capture());
    assertEquals("erreur", captor.getValue().getMessage());
  }

  @Test
  void getAllTournamentByEtat() {
    Tournament tournament = new Tournament();
    tournament.setEtat("SAUVEGARDE");

    Mockito.when(tournamentRepository.getAllByEtat("SAUVEGARDE"))
      .thenReturn(List.of(tournament));

    Iterable<Tournament> result =
      tournamentService.getAllTournamentByEtat("SAUVEGARDE");

    assertNotNull(result);
    assertTrue(result.iterator().hasNext());
    assertEquals("SAUVEGARDE", result.iterator().next().getEtat());

    Mockito.verify(tournamentRepository, times(1))
      .getAllByEtat("SAUVEGARDE");
  }

  @Test
  void save() {
    Tournament tournament = new Tournament();
    tournament.setId(1L);

    // Mock Team
    var team = Mockito.mock(be.vinci.cae.models.Team.class);
    Mockito.when(team.getResponsable()).thenReturn(1L);
    Mockito.when(team.getSecondResponsable()).thenReturn(2L);

    when(teamService.getAllTeams()).thenReturn(List.of(team));

    // Mock Users
    var user1 = Mockito.mock(be.vinci.cae.models.User.class);
    var user2 = Mockito.mock(be.vinci.cae.models.User.class);

    Mockito.when(userRepository.findById(1L)).thenReturn(user1);
    Mockito.when(userRepository.findById(2L)).thenReturn(user2);

    // Mock notification creation
    var notification = Mockito.mock(be.vinci.cae.models.Notification.class);
    Mockito.when(notificationService.createNotification(any()))
      .thenReturn(notification);

    Mockito.when(tournamentRepository.save(tournament))
      .thenReturn(tournament);

    Tournament result = tournamentService.save(tournament);

    assertNotNull(result);
    assertSame(tournament, result);

    Mockito.verify(teamService, times(1)).getAllTeams();
    Mockito.verify(notificationService, times(1)).createNotification(any());
    Mockito.verify(notificationUserService, times(2))
      .createNotificationUser(any());
    Mockito.verify(tournamentRepository, times(1)).save(tournament);
  }

  @Test
  void save_shouldPersistWithoutNotifications_whenNoTeam() {
    Tournament tournament = new Tournament();
    tournament.setId(99L);

    when(teamService.getAllTeams()).thenReturn(List.of());
    when(tournamentRepository.save(tournament)).thenReturn(tournament);

    Tournament result = tournamentService.save(tournament);

    assertNotNull(result);
    assertSame(tournament, result);
    verify(notificationService, times(0)).createNotification(any());
    verify(notificationUserService, times(0)).createNotificationUser(any());
    verify(tournamentRepository, times(1)).save(tournament);
  }


}
