package be.vinci.cae.controllers;

import be.vinci.cae.dto.MatchResultDto;
import be.vinci.cae.models.Match;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.Tournament;
import be.vinci.cae.services.MatchService;
import be.vinci.cae.services.TeamService;
import be.vinci.cae.services.TournamentService;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Exposes endpoints to create and retrieve matches.
 */
@RestController
@RequestMapping("/matches")
public class MatchController {
  private final MatchService matchService;
  private final TournamentService tournamentService;
  private final TeamService teamService;

  /**
   * Creates a controller for match-related operations.
   *
   * @param matchService service used for match persistence and queries
   * @param tournamentService service used to resolve tournament references
   * @param teamService service used to resolve team references
   */
  public MatchController(
      MatchService matchService,
      TournamentService tournamentService,
      TeamService teamService) {
    this.matchService = matchService;
    this.tournamentService = tournamentService;
    this.teamService = teamService;
  }
  
  /**
   * Gets all matches belonging to a tournament.
   *
   * @param id tournament id
   * @return matches for the given tournament
   */
  @GetMapping("/{id}")
  @PreAuthorize("isAuthenticated() OR isAnonymous()")
  public Iterable<Match> getMatchesByTournament(@PathVariable(name = "id") long id) {
    Optional<Tournament> tournament = tournamentService.getTournamentById(id);
    if (tournament.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "tournament not found");
    }

    return matchService.getByTournament(tournament.get());
  }

  /**
   * Creates a new match.
   *
   * @param match match payload
   * @return created match
   */
  @PostMapping({"", "/"})
  public Match createMatch(@RequestBody Match match) {
    return matchService.createMatch(match);
  }

  /**
   * Gets all registrations for a match.
   *
   * @param matchId selected match id
   * @return registrations for the match
   */
  @GetMapping("/match/{matchId}")
  public Match getMatchById(@PathVariable Long matchId) {
    Match match = matchService.findById(matchId);
    if (match == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "match not found");
    }
    return match;
  }

  /**
   * Generates the matches for a tournament.
   *
   * @param tournamentId tournament identifier
   * @return generated matches
   */
  @PostMapping("/matchGeneration/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public List<Match> genererMatch(@PathVariable(name = "id") Long tournamentId) {
    Optional<Tournament> tournament = tournamentService.getTournamentById(tournamentId);
    if (tournament.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "tournament not found");
    }

    Tournament finalTournament = tournament.get();
    if (!matchService.getByTournament(finalTournament).isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Les matchs ont deja ete crees");
    }

    List<Match> matches = matchService.generationMatch(tournamentId);
    if (matches.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pas assez d'equipes inscrites");
    }
    return matches;
  }

  /**
   * Initializes the first round teams for a tournament.
   *
   * @param id tournament identifier
   * @return updated matches
   */
  @PostMapping("/init/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public List<Match> initMatchTeam(@PathVariable(name = "id") Long id) {
    List<Match> matches = matchService.initMatchTeam(id);
    if (matches.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipe deja attribuee");
    }
    return matches;
  }

  /**
   * Updates the teams for the next round of a tournament.
   *
   * @param id tournament identifier
   * @return updated matches
   */
  @PostMapping("/update/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public List<Match> updateMatchTeam(@PathVariable(name = "id") Long id) {
    List<Match> matches = matchService.updateMatchTeam(id);
    if (matches.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Plus de match a attribuer");
    }
    return matches;
  }

  //  /**
  //   * Saves the score of a match.
  //   *
  //   * @param id match identifier
  //   * @param resultTeam1 score for the first team
  //   * @param resultTeam2 score for the second team
  //   * @return updated match
  //   */
  //  @PostMapping("/setResultMatch/{idMatch}/{resultTeam1}/{resultTeam2}")
  //  @PreAuthorize("hasRole('ADMIN')")
  /**
   * Assign an administrator to a match.
   *
   * @param matchId match identifier
   * @param adminId administrator identifier
   * @return updated match
   */
  @PutMapping("/assign/{matchId}/{adminId}")
  @PreAuthorize("hasRole('ADMIN')")
  public Match assignAdministrator(
      @PathVariable Long matchId,
      @PathVariable Long adminId
  ) {
    return matchService.assignAdministrator(matchId, adminId)
        .orElseThrow(() -> {
          // Check which one doesn't exist
          if (matchService.findById(matchId) == null) {
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "match not found");
          }
          return new ResponseStatusException(HttpStatus.NOT_FOUND, "admin not found");
        });
  }

  /**
   * Declare forfeit for a match by a team.
   *
   * @param idMatch match identifier
   * @param idTeam team identifier declaring forfeit
   * @return updated match
   */
  @PutMapping("/forfeit/{idMatch}/{idTeam}")
  @PreAuthorize("isAuthenticated()")
  public Match declareForfeit(
      @PathVariable(name = "idMatch") Long idMatch,
      @PathVariable(name = "idTeam") Long idTeam
  ) {
    Match match = getMatchOrThrow(idMatch);
    Team team = getTeamOrThrow(idTeam);
    return matchService.declareForfeit(match, team);
  }

  /**
   * Get match by team.
   *
   * @param idTeam match payload
   * @return created match
   */
  @GetMapping("/team/{idTeam}")
  @PreAuthorize("isAnonymous() OR isAuthenticated()")
  public List<Match> getMatchByTeam(@PathVariable Long idTeam) {
    Team team = teamService.getById(idTeam).get();
    return matchService.getByTeam(team);
  }

  /**
   * Encode the results of the matches.
   *
   * @param id the id of the match
   * @param dto the match to update
   * @return the updating match
   */
  @PutMapping("/{id}/results")
  @PreAuthorize("hasRole('ADMIN')")
  public Match encodeResults(
      @PathVariable long id,
      @RequestBody MatchResultDto dto
  ) {
    Match result = matchService.setResultat(id, dto);
    if (result == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Match not found or already encoded");
    }
    return result;
  }

  /**
   * Contest a match result.
   *
   * @param idMatch match identifier
   * @param idTeam team identifier
   * @return updated match
   */
  @PutMapping("/contest/{idMatch}/{idTeam}")
  @PreAuthorize("isAuthenticated()")
  public Match contestResult(
      @PathVariable(name = "idMatch") Long idMatch,
      @PathVariable(name = "idTeam") Long idTeam
  ) {
    return applyDecision(idMatch, idTeam, true);
  }

  /**
   * Validate a match result.
   *
   * @param idMatch match identifier
   * @param idTeam team identifier
   * @return updated match
   */
  @PutMapping("/validate/{idMatch}/{idTeam}")
  @PreAuthorize("isAuthenticated()")
  public Match validateResult(
      @PathVariable(name = "idMatch") Long idMatch,
      @PathVariable(name = "idTeam") Long idTeam
  ) {
    return applyDecision(idMatch, idTeam, false);
  }

  /**
   * Resolve match and team, then apply contest or validation on the result.
   *
   * @param idMatch match identifier
   * @param idTeam team identifier
   * @param contest true to contest, false to validate
   * @return updated match
   */
  private Match applyDecision(Long idMatch, Long idTeam, boolean contest) {
    Match match = getMatchOrThrow(idMatch);
    Team team = getTeamOrThrow(idTeam);

    if (contest) {
      return matchService.contested(match, team);
    }
    return matchService.valided(match, team);
  }

  private Match getMatchOrThrow(Long matchId) {
    return matchService.getMatchById(matchId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "match not found"));
  }

  private Team getTeamOrThrow(Long teamId) {
    return teamService.getById(teamId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "team not found"));
  }

}
