package be.vinci.cae.dto;

/**
 * Payload used to update a user password.
 */
public record ChangePasswordDto(
    String oldPassword,
    String newPassword
) {
}
