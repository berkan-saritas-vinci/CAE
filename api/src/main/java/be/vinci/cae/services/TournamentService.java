package be.vinci.cae.services;

import be.vinci.cae.dto.NewNotification;
import be.vinci.cae.dto.NewNotificationUser;
import be.vinci.cae.models.Notification;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.Tournament;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.TournamentRepository;
import be.vinci.cae.repositories.UserRepository;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;


/**
 * Service handling tournament operations.
 */
@Service
public class TournamentService {
  private final TournamentRepository tournamentRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;
  private final NotificationUserService notificationUserService;
  private final TeamService teamService;

  /**
   * Creates the service with its repositories.
   *
   * @param tournamentRepository repository for tournament
   */
  public TournamentService(
      TournamentRepository tournamentRepository,
      UserRepository userRepository,
      NotificationService notificationService,
      NotificationUserService notificationUserService,
      TeamService teamService
  ) {
    this.tournamentRepository = tournamentRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
    this.notificationUserService = notificationUserService;
    this.teamService = teamService;
  }

  /**
   * Returns all tournaments.
   *
   * @return all tournaments
   */
  public Iterable<Tournament> getAllTournament() {
    return tournamentRepository.findAll();
  }

  /**
   * Returns one tournaments.
   *
   * @return one tournaments
   */
  public Optional<Tournament> getTournamentById(Long id) {
    return tournamentRepository.findById(id);
  }

  /**
   * Creates and saves a tournament.
   *
   * @param tournament tournament payload
   * @return saved tournament
   */
  public Tournament addTournament(Tournament tournament) {

    List<User> admin = userRepository.findByRole("ADMIN");
    for (User u : admin) {
      String message = "";
      Date now = new Date(System.currentTimeMillis());

      if ("SAUVEGARDE".equals(tournament.getEtat())) {
        message = "Un nouveau tournois est pret à être publié.";
      } else {
        message = "erreur";
      }

      NewNotification newNotification = new NewNotification(now, message);
      Notification notification = notificationService.createNotification(newNotification);

      NewNotificationUser newNotificationUser = new NewNotificationUser(notification, u);
      notificationUserService.createNotificationUser(newNotificationUser);
    }


    Tournament newTournament = new Tournament();
    newTournament.setDateDebut(tournament.getDateDebut());
    newTournament.setDateFin(tournament.getDateFin());
    newTournament.setDateFinInscription(tournament.getDateFinInscription());
    newTournament.setNom(tournament.getNom());
    newTournament.setDescription(tournament.getDescription());
    newTournament.setEtat("SAUVEGARDE");
    newTournament.setNbrTeam(tournament.getNbrTeam());
    newTournament.setGagnant(tournament.getGagnant());
    newTournament.setNbrTeamInscrite(0L);
    return tournamentRepository.save(newTournament);
  }

  /**
   * Returns all tournaments status.
   *
   * @return all tournaments status
   */
  public Iterable<Tournament> getAllTournamentByEtat(String etat) {
    return tournamentRepository.getAllByEtat(etat);
  }

  /**
   * Met à jour les informations d'un tournois.
   *
   * @param tournament le nouveau user modifié
   * @return l'utilisateur mis à jour
   */
  public Tournament save(Tournament tournament) {
    List<Team> teams = teamService.getAllTeams();
    for (Team t : teams) {
      User responsable = userRepository.findById(t.getResponsable());
      User secondResponsable = userRepository.findById(t.getSecondResponsable());

      String message =
          "Un nouveau tournoi est publié! Allez sur la page d'inscription pour vous y inscrire!!!";
      Date now = new Date(System.currentTimeMillis());

      NewNotification newNotification = new NewNotification(now, message);
      Notification notification = notificationService.createNotification(newNotification);

      NewNotificationUser newNotificationUserResponsable =
          new NewNotificationUser(notification, responsable);
      NewNotificationUser newNotificationUserSecondResponsable =
          new NewNotificationUser(notification, secondResponsable);
      notificationUserService.createNotificationUser(newNotificationUserResponsable);
      notificationUserService.createNotificationUser(newNotificationUserSecondResponsable);
    }
    return tournamentRepository.save(tournament);
  }

  /**
   * Updates the tournament status to A_VENIR.
   *
   * @param id tournament identifier.
   * @return updated tournament or null if not found.
   */
  public Tournament updateTournamentStatusToComingSoon(Long id) {
    Optional<Tournament> tournament = tournamentRepository.findById(id);
    if (tournament.isEmpty()) {
      return null;
    }
    Tournament t = tournament.get();
    t.setEtat("A_VENIR");
    return tournamentRepository.save(t);
  }

}
