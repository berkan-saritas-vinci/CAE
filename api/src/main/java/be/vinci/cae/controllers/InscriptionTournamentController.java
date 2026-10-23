package be.vinci.cae.controllers;

import be.vinci.cae.dto.TeamTournamentRegistrationDto;
import be.vinci.cae.models.InscriptionTournament;
import be.vinci.cae.models.Team;
import be.vinci.cae.services.InscriptionTournamentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for inscription tournament endpoints.
 */
@RestController
@RequestMapping("/inscriptiontournament")
public class InscriptionTournamentController {
  private final InscriptionTournamentService inscriptionTournamentService;

  /**
   * Creates an inscription tournament controller.
   *
   * @param inscriptionTournamentService service handling inscriptions
   */
  public InscriptionTournamentController(
      InscriptionTournamentService inscriptionTournamentService
  ) {
    this.inscriptionTournamentService = inscriptionTournamentService;
  }

  /**
   * Creates a Inscription.
   *
   * @param inscriptionTournament the new Inscription
   * @return the Inscription.
   */
  @PostMapping("/create")
  @PreAuthorize("isAuthenticated()")
  public InscriptionTournament addInscription(
      @RequestBody InscriptionTournament inscriptionTournament
  ) {
    return inscriptionTournamentService.createInscription(inscriptionTournament);
  }

  /**
   * Registers a team to a tournament.
   * Only the team responsible (leader) can register the team.
   *
   * @param tournamentId the tournament ID.
   * @param teamId the team ID.
   * @param registrationDto containing the userId to verify ownership.
   * @return the created inscription.
   */
  @PostMapping("/register/{tournamentId}/team/{teamId}")
  @PreAuthorize("isAuthenticated()")
  @ResponseStatus(HttpStatus.CREATED)
  public InscriptionTournament registerTeamToTournament(
      @PathVariable Long tournamentId,
      @PathVariable Long teamId,
      @Valid @RequestBody TeamTournamentRegistrationDto registrationDto
  ) {
    // Override the IDs from the DTO with the path variables to ensure consistency
    TeamTournamentRegistrationDto validatedDto = new TeamTournamentRegistrationDto(
        teamId,
        tournamentId,
        registrationDto.userId()
    );
    return inscriptionTournamentService.registerTeamToTournament(validatedDto);
  }

  /**
   * Returns all registrations for a given team.
   *
   * @param teamId the team ID
   * @return registrations list
   */
  @GetMapping("/team/{teamId}")
  public ResponseEntity<List<InscriptionTournament>> getInscriptionsByTeamId(
      @PathVariable Long teamId
  ) {
    return ResponseEntity.ok(inscriptionTournamentService.getInscriptionsByTeamId(teamId));
  }

  /**
   * Returns registration counts for all tournaments.
   *
   * @return a map where key is tournamentId and value is number of registered teams
   */
  @GetMapping("/counts")
  public ResponseEntity<Map<Long, Long>> getTournamentRegistrationCounts() {
    return ResponseEntity.ok(inscriptionTournamentService.getTournamentRegistrationCounts());
  }

  /**
   * Returns all teams registered for a given tournament.
   *
   * @param tournamentId the tournament ID
   * @return list of registered teams
   */
  @GetMapping("/tournament/{tournamentId}/teams")
  public ResponseEntity<List<Team>> getTeamsByTournament(@PathVariable Long tournamentId) {
    return ResponseEntity.ok(
      inscriptionTournamentService.getTeamsByTournamentId(tournamentId)
    );
  }

}

