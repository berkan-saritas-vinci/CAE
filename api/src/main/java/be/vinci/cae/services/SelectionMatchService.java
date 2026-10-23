package be.vinci.cae.services;

import be.vinci.cae.dto.NewNotification;
import be.vinci.cae.dto.NewNotificationUser;
import be.vinci.cae.models.Match;
import be.vinci.cae.models.Notification;
import be.vinci.cae.models.SelectionMatch;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.Tournament;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.MatchRepository;
import be.vinci.cae.repositories.SelectionMatchRepository;
import be.vinci.cae.repositories.TeamRepository;
import be.vinci.cae.repositories.UserRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

/**
 * Business service for inscription-match operations.
 */
@Service
public class SelectionMatchService {
  private final SelectionMatchRepository selectionMatchRepository;
  private final MatchRepository matchRepository;
  private final TeamRepository teamRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;
  private final NotificationUserService notificationUserService;

  /**
   * Creates the service with its repository dependency.
   *
   * @param selectionMatchRepository repository used for persistence
   * @param matchRepository repository used to resolve matches
   * @param teamRepository repository used to resolve teams
   * @param userRepository repository used to resolve users
   */
  public SelectionMatchService(
      SelectionMatchRepository selectionMatchRepository,
      MatchRepository matchRepository,
      TeamRepository teamRepository,
      UserRepository userRepository,
      NotificationService notificationService,
      NotificationUserService notificationUserService) {
    this.selectionMatchRepository = selectionMatchRepository;
    this.matchRepository = matchRepository;
    this.teamRepository = teamRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
    this.notificationUserService = notificationUserService;
  }

  /**
   * Registers a team and user for a match.
   *
   * @param matchId target match id
   * @param teamId target team id
   * @param userId target user id
   * @return created registration
   */
  public SelectionMatch registerMatch(Long matchId, Long teamId, Long userId) {
    if (matchId == null || teamId == null || userId == null) {
      return null;
    }

    try {
      Match match = matchRepository.findById(matchId)
          .orElseThrow(() -> new Exception("Match not found"));
      Team team = teamRepository.findById(teamId)
          .orElseThrow(() -> new Exception("Team not found"));
      User user = userRepository.findById(userId)
          .orElseThrow(() -> new Exception("User not found"));

      SelectionMatch newRegistration = new SelectionMatch();
      newRegistration.setTeam(team);
      newRegistration.setMatch(match);
      newRegistration.setUser(user);

      Date now = new Date(System.currentTimeMillis());
      String message = "Vous avez été selectionné pour participé a un nouveau match";

      NewNotification newNotification = new NewNotification(now, message);
      Notification notification = notificationService.createNotification(newNotification);

      NewNotificationUser newNotificationUser = new NewNotificationUser(notification, user);
      notificationUserService.createNotificationUser(newNotificationUser);

      return selectionMatchRepository.save(newRegistration);
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Gets all registrations for a match.
   *
   * @param matchId target match id
   * @return registrations for the match
   */
  public List<SelectionMatch> getByMatch(Long matchId) {
    Optional<Match> match = matchRepository.findById(matchId);
    if (match.isEmpty()) {
      return Collections.emptyList();
    }
    return selectionMatchRepository.getByMatch(match.get());
  }

  /**
   * Deletes a selection for a match.
   *
   * @param matchId target match id
   * @param teamId target team id
   * @param userId target user id
   * @return true if deleted successfully, false otherwise
   */
  public boolean deleteSelection(Long matchId, Long teamId, Long userId) {
    if (matchId == null || teamId == null || userId == null) {
      return false;
    }

    Optional<Match> match = matchRepository.findById(matchId);
    Optional<Team> team = teamRepository.findById(teamId);
    Optional<User> user = userRepository.findById(userId);

    if (match.isEmpty() || team.isEmpty() || user.isEmpty()) {
      return false;
    }

    List<SelectionMatch> selections = selectionMatchRepository.getByMatch(match.get());
    for (SelectionMatch selection : selections) {
      if (selection.getTeam().getId().equals(teamId)
          && selection.getUser().getId() == userId) {
        selectionMatchRepository.deleteById(selection.getId());
        return true;
      }
    }
    return false;
  }

  /**
   * Deletes a selection for a match.
   *
   * @param userId target user id
   * @return true if deleted successfully, false otherwise
   */
  public List<Tournament> getTournamentByUserId(Long userId) {
    Optional<User> user = userRepository.findById(userId);
    Iterable<SelectionMatch> selectionMatchIterable =
        selectionMatchRepository.getByUser(user.get());
    List<Tournament> tournamentList = new ArrayList<>();
    for (SelectionMatch selectionMatch : selectionMatchIterable) {
      Tournament t = selectionMatch.getMatch().getTournament();
      if (!tournamentList.contains(t)) {
        tournamentList.add(t);
      }
    }
    return tournamentList;
  }

  /**
   * Gets all matches where a user has a selection.
   *
   * @param user target user
   * @return distinct matches linked to this user
   */
  public List<Match> getMatchByUser(User user) {
    Iterable<SelectionMatch> selection = selectionMatchRepository.getByUser(user);
    List<Match> matches = new ArrayList<>();

    for (SelectionMatch s : selection) {
      if (matches.contains(s.getMatch())) {
        continue;
      }
      matches.add(s.getMatch());
    }

    return matches;
  }
}
