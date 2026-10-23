package be.vinci.cae.dto;

/**
 * DTO used to update the results of a match.
 */
public class MatchResultDto {
  private int resultTeam1;
  private int resultTeam2;
  private Long administratorId;
  private Long forfeitingTeamId;

  /**
   * Gets the result score of team 1.
   *
   * @return the result score of team 1
   */
  public int getResultTeam1() {
    return resultTeam1;
  }

  /**
   * Sets the result score of team 1.
   *
   * @param resultTeam1 the result score of team 1
   */
  public void setResultTeam1(int resultTeam1) {
    this.resultTeam1 = resultTeam1;
  }

  /**
   * Gets the result score of team 2.
   *
   * @return the result score of team 2
   */
  public int getResultTeam2() {
    return resultTeam2;
  }

  /**
   * Sets the result score of team 2.
   *
   * @param resultTeam2 the result score of team 2
   */
  public void setResultTeam2(int resultTeam2) {
    this.resultTeam2 = resultTeam2;
  }

  /**
   * Gets the ID of the administrator who validated the match result.
   *
   * @return the administrator ID
   */
  public Long getAdministratorId() {
    return administratorId;
  }

  /**
   * Sets the ID of the administrator who validated the match result.
   *
   * @param administratorId the administrator ID
   */
  public void setAdministratorId(Long administratorId) {
    this.administratorId = administratorId;
  }

  /**
   * Gets the ID of the team that forfeited the match.
   *
   * @return the forfeiting team ID
   */
  public Long getForfeitingTeamId() {
    return forfeitingTeamId;
  }

  /**
   * Sets the ID of the team that forfeited the match.
   *
   * @param forfeitingTeamId the forfeiting team ID
   */
  public void setForfeitingTeamId(Long forfeitingTeamId) {
    this.forfeitingTeamId = forfeitingTeamId;
  }
}



