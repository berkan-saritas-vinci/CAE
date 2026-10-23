package be.vinci.cae.models;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.Date;
import lombok.NoArgsConstructor;


/**
 * Entity representing a match in a tournament bracket.
 */
@Entity
@Table(name = "matchs")

@NoArgsConstructor
public class Match {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  @ManyToOne
  @JoinColumn(name = "tournament_id")
  private Tournament tournament;

  @ManyToOne
  @JoinColumn(name = "team1_id")
  private Team team1;

  @ManyToOne
  @Nullable
  @JoinColumn(name = "team2_id")
  private Team team2;

  private Long turn;

  private String status;

  @ManyToOne
  @JoinColumn(name = "Admin_id")
  private User administrator;

  @Nullable
  private Integer resultTeam1;

  @Nullable
  private Integer resultTeam2;

  private boolean team1Validated;

  private boolean team1contested;

  private boolean team2Validated;
  
  private boolean team2contested;

  private Date dateTime;

  /**
   * Gets the administrator who validated the match result.
   *
   * @return the administrator user
   */
  public User getAdministrator() {
    return administrator;
  }

  /**
   * Sets the administrator who validated the match result.
   *
   * @param administrator the administrator user
   */
  public void setAdministrator(User administrator) {
    this.administrator = administrator;
  }

  /**
   * Gets the turn/round number of the match in the tournament bracket.
   *
   * @return the turn number
   */
  public Long getTurn() {
    return turn;
  }

  /**
   * Sets the turn/round number of the match in the tournament bracket.
   *
   * @param turn the turn number
   */
  public void setTurn(Long turn) {
    this.turn = turn;
  }

  /**
   * Gets the date and time when the match is scheduled.
   *
   * @return the match date and time
   */
  public Date getDateTime() {
    return dateTime;
  }

  /**
   * Sets the date and time when the match is scheduled.
   *
   * @param dateTime the match date and time
   */
  public void setDateTime(Date dateTime) {
    this.dateTime = dateTime;
  }

  /**
   * Gets the unique identifier of the match.
   *
   * @return the match ID
   */
  public long getId() {
    return id;
  }

  /**
   * Sets the unique identifier of the match.
   *
   * @param id the match ID
   */
  public void setId(long id) {
    this.id = id;
  }

  /**
   * Gets the result score of team 1.
   *
   * @return the result score of team 1, or null if not yet set
   */
  @Nullable
  public Integer getResultTeam1() {
    return resultTeam1;
  }

  /**
   * Sets the result score of team 1.
   *
   * @param resultTeam1 the result score of team 1
   */
  public void setResultTeam1(@Nullable Integer resultTeam1) {
    this.resultTeam1 = resultTeam1;
  }

  /**
   * Gets the result score of team 2.
   *
   * @return the result score of team 2, or null if not yet set
   */
  @Nullable
  public Integer getResultTeam2() {
    return resultTeam2;
  }

  /**
   * Sets the result score of team 2.
   *
   * @param resultTeam2 the result score of team 2
   */
  public void setResultTeam2(@Nullable Integer resultTeam2) {
    this.resultTeam2 = resultTeam2;
  }

  /**
   * Gets the current status of the match.
   *
   * @return the match status
   */
  public String getStatus() {
    return status;
  }

  /**
   * Sets the current status of the match.
   *
   * @param status the match status
   */
  public void setStatus(String status) {
    this.status = status;
  }

  /**
   * Gets the first team participating in the match.
   *
   * @return team 1
   */
  public Team getTeam1() {
    return team1;
  }

  /**
   * Sets the first team participating in the match.
   *
   * @param team1 team 1
   */
  public void setTeam1(Team team1) {
    this.team1 = team1;
  }

  /**
   * Checks if the result of team 1 has been contested.
   *
   * @return true if team 1's result is contested, false otherwise
   */
  public boolean isTeam1contested() {
    return team1contested;
  }

  /**
   * Sets whether the result of team 1 has been contested.
   *
   * @param team1contested true if team 1's result is contested, false otherwise
   */
  public void setTeam1contested(boolean team1contested) {
    this.team1contested = team1contested;
  }

  /**
   * Checks if the result of team 2 has been contested.
   *
   * @return true if team 2's result is contested, false otherwise
   */
  public boolean isTeam2contested() {
    return team2contested;
  }

  /**
   * Sets whether the result of team 2 has been contested.
   *
   * @param team2contested true if team 2's result is contested, false otherwise
   */
  public void setTeam2contested(boolean team2contested) {
    this.team2contested = team2contested;
  }

  /**
   * Checks if team 2's result has been validated.
   *
   * @return true if team 2's result is validated, false otherwise
   */
  public boolean isTeam2Validated() {
    return team2Validated;
  }

  /**
   * Sets whether team 2's result has been validated.
   *
   * @param team2Validated true if team 2's result is validated, false otherwise
   */
  public void setTeam2Validated(boolean team2Validated) {
    this.team2Validated = team2Validated;
  }

  /**
   * Gets the second team participating in the match.
   *
   * @return team 2, or null if not yet assigned
   */
  @Nullable
  public Team getTeam2() {
    return team2;
  }

  /**
   * Sets the second team participating in the match.
   *
   * @param team2 team 2
   */
  public void setTeam2(@Nullable Team team2) {
    this.team2 = team2;
  }

  /**
   * Checks if team 1's result has been validated.
   *
   * @return true if team 1's result is validated, false otherwise
   */
  public boolean isTeam1Validated() {
    return team1Validated;
  }

  /**
   * Sets whether team 1's result has been validated.
   *
   * @param team1Validated true if team 1's result is validated, false otherwise
   */
  public void setTeam1Validated(boolean team1Validated) {
    this.team1Validated = team1Validated;
  }

  /**
   * Gets the tournament to which this match belongs.
   *
   * @return the tournament
   */
  public Tournament getTournament() {
    return tournament;
  }

  /**
   * Sets the tournament to which this match belongs.
   *
   * @param tournament the tournament
   */
  public void setTournament(Tournament tournament) {
    this.tournament = tournament;
  }
}