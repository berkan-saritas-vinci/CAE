package be.vinci.cae.controllers;

import be.vinci.cae.models.DemandeAdhesion;
import be.vinci.cae.services.DemandeAdhesionService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for team membership requests.
 */
@RestController
@RequestMapping("/adhesions")
public class DemandeAdhesionController {

  private final DemandeAdhesionService service;

  /**
   * Creates the controller.
   *
   * @param service adhesion service
   */
  public DemandeAdhesionController(DemandeAdhesionService service) {
    this.service = service;
  }

  /**
   * Creates a new adhesion request.
   *
   * @param teamId team identifier
   * @param userId user identifier
   * @return created adhesion request
   */
  @PostMapping("/{teamId}")
  public DemandeAdhesion demanderAdhesion(
      @PathVariable Long teamId,
      @RequestParam Long userId
  ) {
    return service.creerDemande(teamId, userId);
  }

  /**
   * Returns all adhesion requests for a team.
   *
   * @param teamId team identifier
   * @return list of adhesion requests
   */
  @GetMapping("/team/{teamId}")
  @PreAuthorize("isAuthenticated()")
  public List<DemandeAdhesion> getDemandes(@PathVariable Long teamId) {
    return service.getDemandesTeam(teamId);
  }

  /**
   * Accepts an adhesion request.
   *
   * @param id adhesion request identifier
   * @return updated adhesion request
   */
  @PutMapping("/{id}/accepter")
  @PreAuthorize("isAuthenticated()")
  public DemandeAdhesion accepter(@PathVariable Long id) {
    return service.accepterDemande(id);
  }

  /**
   * Rejects an adhesion request.
   *
   * @param id adhesion request identifier
   * @param motif rejection reason
   * @return updated adhesion request
   */
  @PutMapping("/{id}/refuser")
  @PreAuthorize("isAuthenticated()")
  public DemandeAdhesion refuser(
      @PathVariable Long id,
      @RequestParam String motif
  ) {
    return service.refuserDemande(id, motif);
  }

  /**
   * Cancels an adhesion request.
   *
   * @param id adhesion request identifier
   */
  @DeleteMapping("/{id}")
  public void annulerDemande(@PathVariable Long id) {
    service.supprimerDemande(id);
  }

  /**
   * Returns all adhesion requests created by a user.
   *
   * @param userId user identifier
   * @return list of adhesion requests for the user
   */
  @GetMapping("/user/{userId}")
  @PreAuthorize("isAuthenticated()")
  public List<DemandeAdhesion> getDemandesByUserId(@PathVariable Long userId) {
    return service.getDemandesByUserId(userId);
  }
}

