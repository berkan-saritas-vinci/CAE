package be.vinci.cae.dto;

/**
 * DTO to update the team validation.
 */
public class TeamValidationDto {
  private Long teamId;
  private boolean validated;

  /**
   * Gets the ID of the team to validate.
   *
   * @return the team ID
   */
  public Long getTeamId() {
    return teamId;
  }

  /**
   * Sets the ID of the team to validate.
   *
   * @param teamId the team ID
   */
  public void setTeamId(Long teamId) {
    this.teamId = teamId;
  }

  /**
   * Checks if the team is validated.
   *
   * @return true if the team is validated, false otherwise
   */
  public boolean isValidated() {
    return validated;
  }

  /**
   * Sets whether the team is validated.
   *
   * @param validated true if the team is validated, false otherwise
   */
  public void setValidated(boolean validated) {
    this.validated = validated;
  }
}
