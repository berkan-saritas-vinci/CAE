package be.vinci.cae.controllers;

import be.vinci.cae.models.Match;
import be.vinci.cae.models.SelectionMatch;
import be.vinci.cae.models.User;
import be.vinci.cae.services.SelectionMatchService;
import be.vinci.cae.services.UserService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller for match registration endpoints.
 */
@RestController
@RequestMapping("/inscriptionMatches")
public class SelectionMatchController {
  private final SelectionMatchService selectionMatchService;
  private final UserService userService;

  /**
   * Creates the controller with its service dependency.
   *
   * @param selectionMatchService service used to register teams/users to a match
   */
  public SelectionMatchController(
      SelectionMatchService selectionMatchService,
      UserService userService
  ) {
    this.selectionMatchService = selectionMatchService;
    this.userService = userService;
  }

  /**
   * Registers a user and a team for a match.
   *
   * @param matchId selected match id
   * @param teamId selected team id
   * @param userId selected user id
   * @return created registration
   */
  @PostMapping({"", "/"})
  @PreAuthorize("isAuthenticated()")
  public SelectionMatch registerMatch(
      @RequestParam("match") Long matchId,
      @RequestParam("team.id") Long teamId,
      @RequestParam("user.id") Long userId
  ) {
    SelectionMatch registration = selectionMatchService.registerMatch(matchId, teamId, userId);
    if (registration == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "Match, team, or user not found");
    }
    return registration;
  }

  /**
   * Gets all registrations for a match.
   *
   * @param matchId selected match id
   * @return registrations for the match
   */
  @GetMapping({"/match/{matchId}"})
  @PreAuthorize("isAuthenticated() OR isAnonymous()")
  public List<SelectionMatch> getSelections(@PathVariable Long matchId) {
    return selectionMatchService.getByMatch(matchId);
  }

  /**
   * Deletes a user and team registration for a match.
   *
   * @param matchId selected match id
   * @param teamId selected team id
   * @param userId selected user id
   * @return true if deleted successfully
   */
  @DeleteMapping({"", "/"})
  @PreAuthorize("isAuthenticated()")
  public boolean deleteSelection(
      @RequestParam("match") Long matchId,
      @RequestParam("team.id") Long teamId,
      @RequestParam("user.id") Long userId
  ) {
    boolean deleted = selectionMatchService.deleteSelection(matchId, teamId, userId);
    if (!deleted) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "Selection not found");
    }
    return true;
  }

  /**
   * Gets all matches where the user has a selection.
   *
   * @param userId selected user id
   * @return matches linked to user selections
   */
  @GetMapping({"/user/{userId}"})
  @PreAuthorize("isAnonymous() OR isAuthenticated()")
  public List<Match> getMatchByUser(@PathVariable Long userId) {
    User user = userService.findById(userId);
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
        "User not found");
    }
    return selectionMatchService.getMatchByUser(user);
  }

}
