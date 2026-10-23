package be.vinci.cae.services;

import be.vinci.cae.models.Team;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.TeamRepository;
import be.vinci.cae.repositories.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * Service for team management.
 */
@Service
public class TeamService {

  private final TeamRepository teamRepository;
  private final UserRepository userRepository;

  /**
   * Creates the service.
   *
   * @param teamRepository team repository.
   * @param userRepository user repository.
   */
  public TeamService(TeamRepository teamRepository, UserRepository userRepository) {
    this.teamRepository = teamRepository;
    this.userRepository = userRepository;
  }

  /**
   * Returns all teams.
   *
   * @return list of all teams.
   */
  public List<Team> getAllTeams() {
    return teamRepository.findAll();
  }

  /**
   * Returns a team by its ID.
   *
   * @param teamId team identifier.
   * @return optional containing the team if found.
   */
  public Optional<Team> getById(long teamId) {
    return teamRepository.findById(teamId);
  }

  /**
   * Returns a team by its name.
   *
   * @param teamName team identifier.
   * @return optional containing the team if found.
   */
  public Optional<Team> getByName(String teamName) {
    return teamRepository.findByName(teamName);
  }

  /**
   * Creates a team.
   *
   * @param team team payload.
   * @return created team.
   * @throws RuntimeException if team with same name already exists.
   */
  public Team createTeam(Team team) {
    if (teamRepository.existsByName(team.getName())) {
      throw new RuntimeException("Team already exists");
    }

    teamRepository.save(team);

    User user = userRepository.findById(team.getResponsable());
    if (user != null) {
      user.setTeam(team);
      userRepository.save(user);
    }

    return team;
  }

  /**
   * Returns all members of a team.
   *
   * @param teamId team identifier.
   * @return list of users in the team.
   */
  @Transactional
  public List<User> getTeamMembers(Long teamId) {
    return userRepository.findByTeamId(teamId);
  }

  /**
   * Returns team for a user.
   *
   * @param userId user identifier.
   * @return team of the user, or null if none.
   */
  public Team getTeamByUserId(Long userId) {
    User user = userRepository.findById(userId.longValue());
    return (user != null) ? user.getTeam() : null;
  }

  /**
   * Removes a user from their team.
   *
   * @param userId user identifier.
   */
  public void quitTeam(Long userId) {
    User user = userRepository.findById(userId.longValue());
    if (user == null) {
      return;
    }

    Team team = user.getTeam();
    user.setTeam(null);
    userRepository.save(user);

    if (team != null && team.getResponsable() == userId) {
      List<User> membres = userRepository.findByTeamId(team.getId());
      if (!membres.isEmpty()) {
        User nouveauResponsable = membres.get(0);
        team.setResponsable(nouveauResponsable.getId());
        teamRepository.save(team);
      }
    }
  }

  /**
   * Returns all teams that have at least one member.
   *
   * @return list of teams with members.
   */
  public List<Team> getTeamsWithMembers() {
    return teamRepository.findAll().stream()
      .filter(team -> !userRepository.findByTeamId(team.getId()).isEmpty())
      .collect(Collectors.toList());
  }

  /**
   * Sets the second responsible for a team.
   *
   * @param teamId team identifier.
   * @param userId user identifier.
   * @return updated team.
   * @throws RuntimeException if team not found.
   */
  public Team setSecondResponsable(Long teamId, Long userId) {
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new RuntimeException("Team not found"));
    team.setSecondResponsable(userId);
    return teamRepository.save(team);
  }

  /**
   * Returns a team by its name.
   *
   * @param teamName team identifier.
   * @return optional containing the team if found.
   */
  public Team findByName(String teamName) {
    return teamRepository.getByName(teamName);
  }

  /**
   * Saves a team.
   *
   * @param team team to save.
   * @return persisted team.
   */
  public Team save(Team team) {
    return teamRepository.save(team);
  }

  /**
   * Sets the main responsible of a team.
   *
   * @param teamId team identifier.
   * @param userId user identifier to promote as responsible.
   * @return updated team.
   */
  public Team setResponsable(Long teamId, Long userId) {
    Team team = teamRepository.findById(teamId)
        .orElseThrow(() -> new IllegalArgumentException("Team not found"));

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    // Mise à jour du responsable
    team.setResponsable(user.getId());

    return teamRepository.save(team);
  }

  /**
   * Handles removal of a user from their team and reassigns responsibles when needed.
   * This method is transactional to ensure DB consistency.
   *
   * @param userId id of the removed user
   */
  @Transactional
  public void handleMemberRemovalAndReassign(Long userId) {
    User user = userRepository.findById(userId).orElse(null);
    if (user == null) {
      return;
    }

    Team team = user.getTeam();

    // remove the user's team reference
    user.setTeam(null);
    userRepository.save(user);

    if (team == null) {
      return;
    }

    boolean wasResponsable = Objects.equals(team.getResponsable(), userId);
    boolean wasSecond = team.getSecondResponsable() > 0
        && Objects.equals(team.getSecondResponsable(), userId);

    if (wasSecond) {
      team.setSecondResponsable(0L);
      teamRepository.save(team);
    }

    if (wasResponsable) {
      // reload to get current values
      Team fresh = teamRepository.findById(team.getId()).orElse(null);
      if (fresh == null) {
        return;
      }

      if (fresh.getSecondResponsable() > 0) {
        fresh.setResponsable(fresh.getSecondResponsable());
        fresh.setSecondResponsable(0L);
        teamRepository.save(fresh);
      } else {
        List<User> membres = userRepository.findByTeamId(team.getId());
        if (!membres.isEmpty()) {
          fresh.setResponsable(membres.get(0).getId());
          teamRepository.save(fresh);
        }
      }
    }
  }

}
