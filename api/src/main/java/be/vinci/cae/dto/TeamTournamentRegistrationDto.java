package be.vinci.cae.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for team tournament registration.
 * Ensures that the user registering the team is the team's responsible.
 */
public record TeamTournamentRegistrationDto(
    @NotNull Long teamId,
    @NotNull Long tournamentId,
    @NotNull Long userId
) {
  /**
   * Returns the team ID.
   *
   * @return the team ID
   */
  @Override
  public Long teamId() {
    return teamId;
  }

  /**
   * Returns the tournament ID.
   *
   * @return the tournament ID
   */
  @Override
  public Long tournamentId() {
    return tournamentId;
  }

  /**
   * Returns the user ID (team responsible).
   *
   * @return the user ID
   */
  @Override
  public Long userId() {
    return userId;
  }
}
