package be.vinci.cae.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

/**
 * Entity representing a team.
 */
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Team {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  private long responsable;

  private long secondResponsable;

  /**
   * Creates a team with name and main responsible.
   *
   * @param name team name.
   * @param responsable team responsible.
   */
  public Team(String name, long responsable) {
    this.name = name;
    this.responsable = responsable;
  }

  /**
   * Creates an empty team.
   */
  public Team() {
    // default constructor required by JPA
  }

  /**
   * Returns the team id.
   *
   * @return the team id.
   */
  public Long getId() {
    return id;
  }

  /**
   * Returns the team name.
   *
   * @return the team name.
   */
  public String getName() {
    return name;
  }

  /**
   * Sets the team name.
   *
   * @param name the team name.
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Returns the main responsible.
   *
   * @return the main responsible.
   */
  public long getResponsable() {
    return responsable;
  }

  /**
   * Sets the main responsible.
   *
   * @param responsable the main responsible.
   */
  public void setResponsable(long responsable) {
    this.responsable = responsable;
  }

  /**
   * Returns the second responsible.
   *
   * @return the second responsible.
   */
  public long getSecondResponsable() {
    return secondResponsable;
  }

  /**
   * Sets the second responsible.
   *
   * @param secondResponsable the second responsible.
   */
  public void setSecondResponsable(long secondResponsable) {
    this.secondResponsable = secondResponsable;
  }
}
