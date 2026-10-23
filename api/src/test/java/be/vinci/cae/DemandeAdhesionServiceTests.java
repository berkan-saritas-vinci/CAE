package be.vinci.cae;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.cae.dto.NewNotificationUser;
import be.vinci.cae.models.DemandeAdhesion;
import be.vinci.cae.models.Notification;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.DemandeAdhesionRepository;
import be.vinci.cae.repositories.TeamRepository;
import be.vinci.cae.repositories.UserRepository;
import be.vinci.cae.services.DemandeAdhesionService;
import be.vinci.cae.services.NotificationService;
import be.vinci.cae.services.NotificationUserService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

public class DemandeAdhesionServiceTests {

  private DemandeAdhesionRepository demandeAdhesionRepo;
  private TeamRepository teamRepo;
  private UserRepository userRepo;
  private NotificationService notificationService;
  private NotificationUserService notificationUserService;

  private DemandeAdhesionService demandeAdhesionService;

  @BeforeEach
  void setUp() {
    demandeAdhesionRepo = org.mockito.Mockito.mock(DemandeAdhesionRepository.class);
    teamRepo = org.mockito.Mockito.mock(TeamRepository.class);
    userRepo = org.mockito.Mockito.mock(UserRepository.class);
    notificationService = org.mockito.Mockito.mock(NotificationService.class);
    notificationUserService = org.mockito.Mockito.mock(NotificationUserService.class);

    demandeAdhesionService = new DemandeAdhesionService(
        demandeAdhesionRepo,
        teamRepo,
        userRepo,
        notificationService,
        notificationUserService
    );
  }

  @Test
  void creerDemande_shouldThrow_whenTeamDoesNotExist() {
    when(teamRepo.findById(10L)).thenReturn(Optional.empty());

    RuntimeException ex = assertThrows(RuntimeException.class,
        () -> demandeAdhesionService.creerDemande(10L, 2L));

    assertEquals("Team not found", ex.getMessage());
  }

  @Test
  void creerDemande_shouldThrow_whenUserDoesNotExist() {
    Team team = new Team();
    team.setResponsable(99L);

    when(teamRepo.findById(10L)).thenReturn(Optional.of(team));
    when(userRepo.findById(Long.valueOf(2L))).thenReturn(Optional.empty());

    RuntimeException ex = assertThrows(RuntimeException.class,
        () -> demandeAdhesionService.creerDemande(10L, 2L));

    assertEquals("User not found", ex.getMessage());
  }

  @Test
  void creerDemande_shouldCreatePendingRequestAndNotifyResponsable() {
    Team team = new Team();
    team.setName("Team A");
    team.setResponsable(99L);

    User requester = new User();
    requester.setId(2L);
    requester.setTag("player42");

    User responsable = new User();
    responsable.setId(99L);

    Notification notification = new Notification();
    notification.setId(50L);

    when(teamRepo.findById(10L)).thenReturn(Optional.of(team));
    when(userRepo.findById(Long.valueOf(2L))).thenReturn(Optional.of(requester));
    when(userRepo.findById(99L)).thenReturn(responsable);
    when(notificationService.createNotification(any())).thenReturn(notification);
    when(demandeAdhesionRepo.save(any(DemandeAdhesion.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    DemandeAdhesion result = demandeAdhesionService.creerDemande(10L, 2L);

    assertSame(requester, result.getUser());
    assertSame(team, result.getTeam());
    assertEquals("EN_ATTENTE", result.getStatut());

    ArgumentCaptor<NewNotificationUser> captor = ArgumentCaptor.forClass(NewNotificationUser.class);
    verify(notificationUserService).createNotificationUser(captor.capture());
    assertSame(notification, captor.getValue().getNotification());
    assertSame(responsable, captor.getValue().getUser());
  }

  @Test
  void getDemandesTeam_shouldReturnRepositoryValue() {
    DemandeAdhesion d1 = new DemandeAdhesion();
    DemandeAdhesion d2 = new DemandeAdhesion();
    when(demandeAdhesionRepo.findByTeamId(10L)).thenReturn(List.of(d1, d2));

    List<DemandeAdhesion> result = demandeAdhesionService.getDemandesTeam(10L);

    assertEquals(2, result.size());
    assertSame(d1, result.get(0));
    assertSame(d2, result.get(1));
  }

  @Test
  void accepterDemande_shouldThrow_whenRequestNotFound() {
    when(demandeAdhesionRepo.findById(7L)).thenReturn(Optional.empty());

    RuntimeException ex = assertThrows(RuntimeException.class,
        () -> demandeAdhesionService.accepterDemande(7L));

    assertEquals("Demande introuvable", ex.getMessage());
  }

  @Test
  void accepterDemande_shouldAcceptAssignTeamAndNotifyUser() {
    Team team = new Team();
    team.setName("Team B");

    User user = new User();
    user.setId(5L);

    DemandeAdhesion demande = new DemandeAdhesion();
    demande.setUser(user);
    demande.setTeam(team);
    demande.setStatut("EN_ATTENTE");

    Notification notification = new Notification();
    notification.setId(88L);

    when(demandeAdhesionRepo.findById(1L)).thenReturn(Optional.of(demande));
    when(notificationService.createNotification(any())).thenReturn(notification);
    when(demandeAdhesionRepo.save(any(DemandeAdhesion.class))).thenReturn(demande);

    DemandeAdhesion result = demandeAdhesionService.accepterDemande(1L);

    assertSame(demande, result);
    assertEquals("ACCEPTEE", result.getStatut());
    assertSame(team, user.getTeam());

    verify(userRepo).save(user);
    verify(notificationService).createNotification(any());
    verify(notificationUserService).createNotificationUser(any());
    verify(demandeAdhesionRepo, times(1)).save(demande);
  }

  @Test
  void refuserDemande_shouldThrow_whenRequestNotFound() {
    when(demandeAdhesionRepo.findById(7L)).thenReturn(Optional.empty());

    RuntimeException ex = assertThrows(RuntimeException.class,
        () -> demandeAdhesionService.refuserDemande(7L, "motif"));

    assertEquals("Demande introuvable", ex.getMessage());
  }

  @Test
  void refuserDemande_shouldRejectAndSetReasonAndNotifyUser() {
    Team team = new Team();
    team.setName("Team C");

    User user = new User();
    user.setId(6L);

    DemandeAdhesion demande = new DemandeAdhesion();
    demande.setUser(user);
    demande.setTeam(team);

    Notification notification = new Notification();
    notification.setId(90L);

    when(demandeAdhesionRepo.findById(2L)).thenReturn(Optional.of(demande));
    when(notificationService.createNotification(any())).thenReturn(notification);
    when(demandeAdhesionRepo.save(any(DemandeAdhesion.class))).thenReturn(demande);

    DemandeAdhesion result = demandeAdhesionService.refuserDemande(2L, "Profil incomplet");

    assertSame(demande, result);
    assertEquals("REFUSEE", result.getStatut());
    assertEquals("Profil incomplet", result.getMotifRefus());

    verify(notificationService).createNotification(any());
    verify(notificationUserService).createNotificationUser(any());
    verify(demandeAdhesionRepo).save(demande);
  }

  @Test
  void supprimerDemande_shouldDelegateToRepository() {
    demandeAdhesionService.supprimerDemande(33L);

    verify(demandeAdhesionRepo).deleteById(33L);
  }

  @Test
  void getDemandesByUserId_shouldReturnRepositoryValue() {
    DemandeAdhesion d1 = new DemandeAdhesion();
    when(demandeAdhesionRepo.findByUserId(4L)).thenReturn(List.of(d1));

    List<DemandeAdhesion> result = demandeAdhesionService.getDemandesByUserId(4L);

    assertEquals(1, result.size());
    assertSame(d1, result.get(0));
  }
}
