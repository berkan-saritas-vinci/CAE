package be.vinci.cae.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

/**
 * Entity representing a team adhesion request.
 */
@Entity
public class DemandeAdhesion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private User user;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "team_id")
  @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  private Team team;

  private String statut;

  private String motifRefus;

  /**
   * Returns the request id.
   *
   * @return request id
   */
  public Long getId() {
    return id;
  }

  /**
   * Returns the user linked to the request.
   *
   * @return request user
   */
  public User getUser() {
    return user;
  }

  /**
   * Sets the user linked to the request.
   *
   * @param user request user
   */
  public void setUser(User user) {
    this.user = user;
  }

  /**
   * Returns the team linked to the request.
   *
   * @return request team
   */
  public Team getTeam() {
    return team;
  }

  /**
   * Sets the team linked to the request.
   *
   * @param team request team
   */
  public void setTeam(Team team) {
    this.team = team;
  }

  /**
   * Returns request status.
   *
   * @return status value
   */
  public String getStatut() {
    return statut;
  }

  /**
   * Sets request status.
   *
   * @param statut status value
   */
  public void setStatut(String statut) {
    this.statut = statut;
  }

  /**
   * Returns rejection reason.
   *
   * @return rejection reason
   */
  public String getMotifRefus() {
    return motifRefus;
  }

  /**
   * Sets rejection reason.
   *
   * @param motifRefus rejection reason
   */
  public void setMotifRefus(String motifRefus) {
    this.motifRefus = motifRefus;
  }
}
