package be.vinci.cae.services;

import be.vinci.cae.dto.NewNotification;
import be.vinci.cae.dto.NewNotificationUser;
import be.vinci.cae.models.DemandeAdhesion;
import be.vinci.cae.models.Notification;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.DemandeAdhesionRepository;
import be.vinci.cae.repositories.TeamRepository;
import be.vinci.cae.repositories.UserRepository;
import java.util.Date;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for adhesion requests lifecycle.
 */
@Service
public class DemandeAdhesionService {

  private final DemandeAdhesionRepository demandeAdhesionRepo;
  private final TeamRepository teamRepo;
  private final UserRepository userRepo;
  private final NotificationService notificationService;
  private final NotificationUserService notificationUserService;

  /**
   * Creates the service.
   *
   * @param demandeAdhesionRepo adhesion repository.
   * @param teamRepo team repository.
   * @param userRepo user repository.
   * @param notificationService notification service.
   * @param notificationUserService notification user service.
   */
  public DemandeAdhesionService(
      DemandeAdhesionRepository demandeAdhesionRepo,
      TeamRepository teamRepo,
      UserRepository userRepo,
      NotificationService notificationService,
      NotificationUserService notificationUserService
  ) {
    this.demandeAdhesionRepo = demandeAdhesionRepo;
    this.teamRepo = teamRepo;
    this.userRepo = userRepo;
    this.notificationService = notificationService;
    this.notificationUserService = notificationUserService;
  }

  /**
   * Creates an adhesion request.
   *
   * @param teamId team identifier.
   * @param userId user identifier.
   * @return created request.
   */
  public DemandeAdhesion creerDemande(Long teamId, Long userId) {

    Team team = teamRepo.findById(teamId)
        .orElseThrow(() -> new RuntimeException("Team not found"));

    User userRequire = userRepo.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    DemandeAdhesion demande = new DemandeAdhesion();
    demande.setUser(userRequire);
    demande.setTeam(team);
    demande.setStatut("EN_ATTENTE");

    // Create a new notification
    Date now = new Date(System.currentTimeMillis());
    String message = userRequire.getTag().toString()
        + " veut rejoindre la team "
        + team.getName().toString();
    NewNotification newNotification = new NewNotification(now, message);
    Notification notification = notificationService.createNotification(newNotification);

    // Find the team responsable
    User responsable = userRepo.findById(team.getResponsable());

    // Create a notification user with the notification
    NewNotificationUser newNotificationUser = new NewNotificationUser(notification, responsable);
    notificationUserService.createNotificationUser(newNotificationUser);

    return demandeAdhesionRepo.save(demande);
  }

  /**
   * Returns all requests for a team.
   *
   * @param teamId team identifier.
   * @return team requests.
   */
  public List<DemandeAdhesion> getDemandesTeam(Long teamId) {
    return demandeAdhesionRepo.findByTeamId(teamId);
  }

  /**
   * Accepts an adhesion request.
   *
   * @param id request identifier.
   * @return updated request.
   */
  public DemandeAdhesion accepterDemande(Long id) {
    DemandeAdhesion demande = demandeAdhesionRepo.findById(id)
        .orElseThrow(() -> new RuntimeException("Demande introuvable"));
    demande.setStatut("ACCEPTEE");

    User user = demande.getUser();
    user.setTeam(demande.getTeam());
    userRepo.save(user);
    Team team = user.getTeam();

    // Create a new notification
    Date now = new Date(System.currentTimeMillis());
    String message = "La team " + team.getName()
        + " a accepté votre demande d'adhésion";
    return saveDemandeWithNotification(demande, user, now, message);
  }

  /**
   * Rejects an adhesion request.
   *
   * @param id request identifier.
   * @param motif rejection reason.
   * @return updated request.
   */
  public DemandeAdhesion refuserDemande(Long id, String motif) {
    DemandeAdhesion demande = demandeAdhesionRepo.findById(id)
        .orElseThrow(() -> new RuntimeException("Demande introuvable"));
    demande.setStatut("REFUSEE");
    demande.setMotifRefus(motif);

    User user = demande.getUser();
    Team team = demande.getTeam();

    // Create a new notification
    Date now = new Date(System.currentTimeMillis());
    String message = "La team " + team.getName()
        + " a refusé votre demande d'adhésion pour le motif suivant: " + motif;
    return saveDemandeWithNotification(demande, user, now, message);
  }

  private DemandeAdhesion saveDemandeWithNotification(DemandeAdhesion demande, User user,
      Date now, String message) {
    NewNotification newNotification = new NewNotification(now, message);
    Notification notification = notificationService.createNotification(newNotification);

    // Create a notification user with the notification
    NewNotificationUser newNotificationUser = new NewNotificationUser(notification, user);
    notificationUserService.createNotificationUser(newNotificationUser);

    return demandeAdhesionRepo.save(demande);
  }

  /**
   * Deletes an adhesion request.
   *
   * @param id request identifier.
   */
  public void supprimerDemande(Long id) {
    demandeAdhesionRepo.deleteById(id);
  }

  /**
   * Returns all adhesion requests created by a user.
   *
   * @param userId user identifier.
   * @return user requests.
   */
  public List<DemandeAdhesion> getDemandesByUserId(Long userId) {
    return demandeAdhesionRepo.findByUserId(userId);
  }

}
