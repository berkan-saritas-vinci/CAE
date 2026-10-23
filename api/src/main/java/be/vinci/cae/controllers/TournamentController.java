package be.vinci.cae.controllers;

import be.vinci.cae.models.Tournament;
import be.vinci.cae.services.SelectionMatchService;
import be.vinci.cae.services.TournamentService;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST controller exposing endpoints for tournament management.
 */
@RestController
@RequestMapping("/tournaments")
public class TournamentController {
  private final TournamentService tournamentService;
  private final SelectionMatchService selectionMatchService;

  /**
   * Creates the controller.
   *
   * @param tournamentService service for tournament operations
   */
  public TournamentController(
      TournamentService tournamentService,
      SelectionMatchService selectionMatchService
  ) {
    this.tournamentService = tournamentService;
    this.selectionMatchService = selectionMatchService;
  }

  /**
   * Returns all tournaments.
   *
   * @return all tournaments
   */
  @GetMapping("/all")
  public Iterable<Tournament> getTournament() {
    return tournamentService.getAllTournament();
  }

  /**
   * Returns all tournaments filtered by status.
   *
   * @return all tournaments filtered by status
   */
  @GetMapping("/all/{statut}")
  public Iterable<Tournament> getTournament(@PathVariable String statut) {
    return tournamentService.getAllTournamentByEtat(statut);
  }

  /**
   * Returns one tournament.
   *
   * @return one tournament
   */
  @GetMapping("/id/{id}")
  public ResponseEntity<Optional<Tournament>> getTournamentById(@PathVariable Long id) {
    Optional<Tournament> tournament = tournamentService.getTournamentById(id);
    if (tournament.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(tournament);
  }

  /**
   * Returns all tournaments filtered by status.
   *
   * @return all tournaments filtered by status
   */
  @PatchMapping("/publish/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Object> updateTournamentStatusToSauvegarde(@PathVariable Long id) {
    Optional<Tournament> tournament = tournamentService.getTournamentById(id);
    if (tournament.isEmpty()) {
      return ResponseEntity.notFound().build();
    }
    tournament.get().setEtat("INSCRIPTION_OUVERTE");
    Tournament t = tournament.get();
    tournamentService.save(t);
    return ResponseEntity.ok(tournament);
  }

  /**
   * Updates tournament fields.
   *
   * @param id tournament identifier.
   * @param payload partial tournament payload.
   * @return updated tournament response.
   */
  @PatchMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Object> updateTournament(
      @PathVariable Long id,
      @RequestBody Tournament payload
  ) {
    Optional<Tournament> existing = tournamentService.getTournamentById(id);
    if (existing.isEmpty()) {
      return ResponseEntity.notFound().build();
    }

    Tournament tournament = existing.get();
    if (payload.getNom() != null) {
      tournament.setNom(payload.getNom());
    }
    if (payload.getDescription() != null) {
      tournament.setDescription(payload.getDescription());
    }
    if (payload.getDateDebut() != null) {
      tournament.setDateDebut(payload.getDateDebut());
    }
    if (payload.getDateFin() != null) {
      tournament.setDateFin(payload.getDateFin());
    }
    if (payload.getDateFinInscription() != null) {
      tournament.setDateFinInscription(payload.getDateFinInscription());
    }
    if (payload.getEtat() != null) {
      tournament.setEtat(payload.getEtat());
    }
    if (payload.getNbrTeam() != null && payload.getNbrTeam() > 0) {
      tournament.setNbrTeam(payload.getNbrTeam());
    }

    Tournament updated = tournamentService.save(tournament);
    return ResponseEntity.ok(updated);
  }

  /**
   * Creates a tournament.
   *
   * @param newTournament tournament payload
   * @return created tournament
   */
  @PostMapping({"", "/"})
  @PreAuthorize("hasRole('ADMIN')")
  public Tournament addTournament(@RequestBody Tournament newTournament) {
    return tournamentService.addTournament(newTournament);
  }

  /**
   * Creates a tournament.
   *
   * @return created tournament
   */
  @GetMapping({"/user/{userId}"})
  @PreAuthorize("isAnonymous() OR isAuthenticated()")
  public List<Tournament> getTournamentByUserId(@PathVariable Long userId) {
    return selectionMatchService.getTournamentByUserId(userId);
  }

  /**
   * change tournament status to "A_VENIR".
   *
   * @return the updated tournament
   */
  @PutMapping("/{tournamentId}/state")
  @PreAuthorize("isAnonymous() OR isAuthenticated()")
  public Tournament updateTournamentStatusToComingSoon(
      @PathVariable(name = "tournamentId") Long tournamentId
  ) {
    Tournament tournament = tournamentService.updateTournamentStatusToComingSoon(tournamentId);
    if (tournament == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "tournament not found");
    }
    return tournament;
  }

}
