package be.vinci.cae.services;

import be.vinci.cae.dto.NewNotification;
import be.vinci.cae.dto.NewNotificationUser;
import be.vinci.cae.dto.TeamTournamentRegistrationDto;
import be.vinci.cae.models.InscriptionTournament;
import be.vinci.cae.models.Notification;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.Tournament;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.InscriptionTournamentRepository;
import be.vinci.cae.repositories.TeamRepository;
import be.vinci.cae.repositories.TournamentRepository;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Service for inscription tournament business operations.
 */
@Service
public class InscriptionTournamentService {
  private final InscriptionTournamentRepository inscriptionTournamentRepository;
  private final TeamRepository teamRepository;
  private final TournamentRepository tournamentRepository;
  private final UserService userService;
  private final NotificationService notificationService;
  private final NotificationUserService notificationUserService;

  /**
   * Creates an inscription tournament service.
   *
   * @param inscriptionTournamentRepository repository for inscriptions
   */
  public InscriptionTournamentService(
      InscriptionTournamentRepository inscriptionTournamentRepository,
      TeamRepository teamRepository,
      TournamentRepository tournamentRepository,
      UserService userService,
      NotificationService notificationService,
      NotificationUserService notificationUserService
  ) {
    this.inscriptionTournamentRepository = inscriptionTournamentRepository;
    this.teamRepository = teamRepository;
    this.tournamentRepository = tournamentRepository;
    this.userService = userService;
    this.notificationService = notificationService;
    this.notificationUserService = notificationUserService;
  }

  /**
   * Creates a new inscription.
   *
   * @param inscriptionTournament inscription data
   * @return created inscription
   */
  public InscriptionTournament createInscription(
      InscriptionTournament inscriptionTournament
  ) {
    if (inscriptionTournament == null
        || inscriptionTournament.getTeam() == null
        || inscriptionTournament.getTeam().getId() == null
        || inscriptionTournament.getTournament() == null
        || inscriptionTournament.getTournament().getId() == null) {
      return null;
    }

    Long teamId = inscriptionTournament.getTeam().getId();
    Long tournamentId = inscriptionTournament.getTournament().getId();

    Optional<Team> team = teamRepository.findById(teamId);
    if (team.isEmpty()) {
      return null;
    }

    Optional<Tournament> tournament = tournamentRepository.findById(tournamentId);
    Tournament existingTournament = getTournamentOrThrow(tournament);

    if (existingTournament == null) {
      return null;
    }

    if (assertNotAlreadyRegistered(teamId, tournamentId) == null) {
      return null;
    }

    InscriptionTournament inscription = saveInscription(team.get(), existingTournament);
    notifyTeamMembers(teamId, inscription.getTournament());
    return inscription;
  }

  /**
   * Registers a team to a tournament with verification that the user is the team responsible.
   *
   * @param registrationDto data containing teamId, tournamentId, and userId (team responsible)
   * @return created inscription
   * @throws ResponseStatusException if user is not the team responsible or if registration fails
   */
  public InscriptionTournament registerTeamToTournament(
      TeamTournamentRegistrationDto registrationDto
  ) {
    if (registrationDto == null
        || registrationDto.teamId() == null
        || registrationDto.tournamentId() == null
        || registrationDto.userId() == null) {
      return null;
    }

    Long teamId = registrationDto.teamId();
    Long tournamentId = registrationDto.tournamentId();
    Long userId = registrationDto.userId();

    // Verify team exists
    Optional<Team> teamOpt = teamRepository.findById(teamId);
    if (teamOpt.isEmpty()) {
      return null;
    }

    Team team = teamOpt.get();

    // Verify that the user is the team responsible
    if (team.getResponsable() != userId) {
      return null;
    }

    // Verify tournament exists
    Optional<Tournament> tournamentOpt = tournamentRepository.findById(tournamentId);
    Tournament existingTournament = getTournamentOrThrow(tournamentOpt);
    if (assertNotAlreadyRegistered(teamId, tournamentId) == null) {
      return null;
    }

    InscriptionTournament inscription = saveInscription(team, existingTournament);
    notifyTeamMembers(teamId, existingTournament);
    return inscription;
  }

  /**
   * Returns all tournament registrations for a team.
   *
   * @param teamId the team identifier
   * @return list of registrations
   */
  public List<InscriptionTournament> getInscriptionsByTeamId(Long teamId) {
    return inscriptionTournamentRepository.findByTeamId(teamId);
  }

  /**
   * Returns inscription counts by tournament id.
   *
   * @return map where key is tournamentId and value is number of registered teams
   */
  public Map<Long, Long> getTournamentRegistrationCounts() {
    Map<Long, Long> counts = new HashMap<>();
    List<Object[]> rows = inscriptionTournamentRepository.countGroupedByTournamentId();

    for (Object[] row : rows) {
      Long tournamentId = (Long) row[0];
      Long inscriptionCount = (Long) row[1];
      counts.put(tournamentId, inscriptionCount);
    }

    return counts;
  }

  private Tournament getTournamentOrThrow(Optional<Tournament> tournament) {
    return tournament.orElse(null);
  }

  private Boolean assertNotAlreadyRegistered(Long teamId, Long tournamentId) {
    if (inscriptionTournamentRepository.existsByTeamIdAndTournamentId(teamId, tournamentId)) {
      return null;
    }
    return true;
  }

  private void notifyTeamMembers(Long teamId, Tournament tournament) {
    List<User> users = userService.getUsersByTeam(teamId);
    for (User u : users) {
      Date now = new Date(System.currentTimeMillis());
      String message = "Votre équipe est inscrite à un nouveau tournoi : " + tournament.getNom();

      NewNotification newNotification = new NewNotification(now, message);
      Notification notification = notificationService.createNotification(newNotification);

      NewNotificationUser newNotificationUser = new NewNotificationUser(notification, u);
      notificationUserService.createNotificationUser(newNotificationUser);
    }
  }

  private InscriptionTournament saveInscription(Team team, Tournament tournament) {
    InscriptionTournament newInscription = new InscriptionTournament();
    newInscription.setTeam(team);
    Long currentRegistered =
        tournament.getNbrTeamInscrite() == null ? 0L : tournament.getNbrTeamInscrite();
    tournament.setNbrTeamInscrite(currentRegistered + 1);
    newInscription.setTournament(tournament);

    if (tournament.getNbrTeam() != null
        && tournament.getNbrTeam().longValue() == tournament.getNbrTeamInscrite().longValue()) {
      tournament.setEtat("A_VENIR");
    }

    // Persist tournament counters/state alongside the new registration.
    tournamentRepository.save(tournament);
    return inscriptionTournamentRepository.save(newInscription);
  }

  /**
   * Returns teams registered to a tournament.
   *
   * @param tournamentId tournament identifier
   * @return registered teams
   */
  public List<Team> getTeamsByTournamentId(Long tournamentId) {
    List<InscriptionTournament> inscriptions =
        inscriptionTournamentRepository.findByTournamentId(tournamentId);

    return inscriptions.stream()
        .map(InscriptionTournament::getTeam)
        .toList();
  }

}
