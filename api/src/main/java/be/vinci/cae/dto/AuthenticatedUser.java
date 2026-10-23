package be.vinci.cae.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Represents a user who has been successfully authenticated. This record holds
 * the essential information of an authenticated user, namely the user's email
 * and an authentication token. id and role are kept for notification management.
 */
public record AuthenticatedUser(
    @NotBlank String mail,
    @NotBlank String token,
    long id,
    String role
) {
  /**
   * Returns the email of the authenticated user.
   *
   * @return the user's email, guaranteed to be non-blank
   */
  @Override
  public String mail() {
    return mail;
  }

  /**
   * Returns the authentication token associated with the user.
   *
   * @return the user's authentication token, guaranteed to be non-blank
   */
  @Override
  public String token() {
    return token;
  }

  /**
   * Returns the user's unique identifier.
   *
   * @return the user's id
   */
  @Override
  public long id() {
    return id;
  }

}
