package be.vinci.cae.controllers;

import be.vinci.cae.models.Team;
import be.vinci.cae.models.User;
import be.vinci.cae.services.TeamService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for team management.
 */
@RestController
@RequestMapping("/team")
public class TeamController {

  private final TeamService teamService;

  /**
   * Creates the controller.
   *
   * @param teamService team service.
   */
  public TeamController(TeamService teamService) {
    this.teamService = teamService;
  }

  /**
   * Returns all teams.
   *
   * @return list of all teams.
   */
  @GetMapping("/all")
  public List<Team> getTeams() {
    return teamService.getAllTeams();
  }

  /**
   * Creates a team.
   *
   * @param team team payload.
   * @return created team.
   */
  @PostMapping
  public Team createTeam(@RequestBody Team team) {
    return teamService.createTeam(team);
  }

  /**
   * Returns team members.
   *
   * @param id team identifier.
   * @return list of team members.
   */
  @GetMapping("/{id}/members")
  public List<User> getTeamMembers(@PathVariable Long id) {
    return teamService.getTeamMembers(id);
  }

  /**
   * Returns team for a user.
   *
   * @param userId user identifier.
   * @return team response or 404 if not found.
   */
  @GetMapping("/user/{userId}")
  public ResponseEntity<Team> getTeamByUserId(@PathVariable Long userId) {
    Team team = teamService.getTeamByUserId(userId);
    if (team == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(team);
  }

  /**
   * Removes a user from its team.
   *
   * @param userId user identifier.
   * @return empty success response.
   */
  @PutMapping("/user/{userId}/quit")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Void> quitTeam(@PathVariable Long userId) {
    teamService.quitTeam(userId);
    return ResponseEntity.ok().build();
  }

  /**
   * Returns all teams that have at least one member.
   *
   * @return list of teams with members.
   */
  @GetMapping("/with-members")
  public List<Team> getTeamsWithMembers() {
    return teamService.getTeamsWithMembers();
  }

  /**
   * Sets the second responsible for a team.
   *
   * @param teamId team identifier.
   * @param userId user identifier.
   * @return updated team.
   */
  @PutMapping("/{teamId}/second-responsable/{userId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Team> setSecondResponsable(
      @PathVariable Long teamId,
      @PathVariable Long userId
  ) {
    return ResponseEntity.ok(teamService.setSecondResponsable(teamId, userId));
  }

  /**
   * Returns true if the user is responsable or second-responsable.
   *
   * @return the team.
   */
  @GetMapping("/{name}/{idUser}")
  public boolean getTeamByName(@PathVariable String name, @PathVariable long idUser) {
    Team team = teamService.findByName(name);
    if (team == null) {
      return ResponseEntity.notFound().build().hasBody();
    }

    return team.getResponsable() == idUser || team.getSecondResponsable() == idUser;
  }

  /**
   * Returns a team by name.
   *
   * @return the team.
   */
  @GetMapping("/name/{name}")
  public ResponseEntity<Team> getTeamByName(@PathVariable String name) {
    Team team = teamService.findByName(name);
    if (team == null) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(team);
  }

  /**
   * Sets the main responsible (team leader) for a team.
   *
   * @param teamId ID of the team.
   * @param userId ID of the user to promote as responsible.
   * @return the updated team, or an error response if invalid.
   */
  @PutMapping("/{teamId}/responsable/{userId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<?> setResponsable(
      @PathVariable Long teamId,
      @PathVariable Long userId
  ) {
    try {
      Team updated = teamService.setResponsable(teamId, userId);
      return ResponseEntity.ok(updated);

    } catch (IllegalArgumentException e) {
      // Mauvaise requête (team ou user inexistant)
      return ResponseEntity.badRequest().body(e.getMessage());

    } catch (Exception e) {
      // Erreur interne inattendue
      return ResponseEntity.internalServerError().body("Unexpected error");
    }
  }

  /**
   * Excludes a user from a team.
   * This operation removes the user from their current team.
   *
   * @param teamId ID of the team.
   * @param userId ID of the user to exclude.
   * @return empty success response.
   */
  @PutMapping("/{teamId}/exclude/{userId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Void> excludeMember(
      @PathVariable Long teamId,
      @PathVariable Long userId
  ) {
    teamService.quitTeam(userId);
    return ResponseEntity.ok().build();
  }
}
