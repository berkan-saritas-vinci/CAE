package be.vinci.cae.seeds;

import be.vinci.cae.models.Picture;
import be.vinci.cae.models.Speciality;
import be.vinci.cae.repositories.PictureRepository;
import be.vinci.cae.repositories.SpecialityRepository;
import java.util.List;

/**
 * Shared helper methods and constants used by seed initializers.
 */
public final class SeedDataSupport {

  static final List<String> SPECIALITY_NAMES = List.of(
      "Architecte",
      "Exécuteur",
      "Tacticien",
      "Gardien",
      "Catalyseur",
      "Perturbateur",
      "Guérisseur"
  );

  static final List<String> DEV_SPECIALITY_NAMES = List.of(
      "Tacticien",
      "Exécuteur",
      "Architecte",
      "Gardien",
      "Catalyseur"
  );

  static final List<String> DEMO_AVATAR_LINKS = List.of(
      "/src/assets/avatars/avatar1.jpg",
      "/src/assets/avatars/avatar2.jpg",
      "/src/assets/avatars/avatar3.jpg",
      "/src/assets/avatars/avatar4.jpg",
      "/src/assets/avatars/avatar5.avif",
      "/src/assets/avatars/avatar6.jpg",
      "/src/assets/avatars/avatar7.jpg",
      "/src/assets/avatars/avatar8.jpg",
      "/src/assets/avatars/avatar9.jpg",
      "/src/assets/avatars/avatar10.jpg",
      "/src/assets/avatars/avatar11.jpg",
      "/src/assets/avatars/avatar12.jpg",
      "/src/assets/avatars/avatar13.jpg",
      "/src/assets/avatars/avatar14.jpg",
      "/src/assets/avatars/avatar15.jpg",
      "/src/assets/avatars/avatar16.jpg",
      "/src/assets/avatars/avatar17.jpg",
      "/src/assets/avatars/avatar18.jpg",
      "/src/assets/avatars/avatar19.jpg",
      "/src/assets/avatars/avatar20.jpg"
  );

  static final List<String> TEST_AVATAR_LINKS = List.of(
      "/src/assets/avatars/avatar1.jpg",
      "/src/assets/avatars/avatar2.jpg",
      "/src/assets/avatars/avatar3.jpg",
      "/src/assets/avatars/avatar4.jpg",
      "/src/assets/avatars/avatar5.avif",
      "/src/assets/avatars/avatar6.jpg",
      "/src/assets/avatars/avatar7.jpg",
      "/src/assets/avatars/avatar8.jpg"
  );

  static final List<String> DEV_AVATAR_LINKS = List.of(
      "/src/assets/avatars/avatar1.jpg",
      "/src/assets/avatars/avatar2.jpg",
      "/src/assets/avatars/avatar3.jpg",
      "/src/assets/avatars/avatar4.jpg",
      "/src/assets/avatars/avatar5.avif"
  );

  private SeedDataSupport() {
  }

  static void initializePicturesAndSpecialities(PictureRepository pictureRepository,
      SpecialityRepository specialityRepository,
      List<String> avatarLinks,
      List<String> specialityNames) {
    avatarLinks.forEach(link -> {
      if (!pictureRepository.existsByLink(link)) {
        Picture picture = new Picture();
        picture.setLink(link);
        pictureRepository.save(picture);
      }
    });

    specialityNames.forEach(name -> {
      if (!specialityRepository.existsBySpeciality(name)) {
        Speciality speciality = new Speciality();
        speciality.setSpeciality(name);
        specialityRepository.save(speciality);
      }
    });
  }

  static String buildSeedDate(int index) {
    return "2026-02-" + String.format("%02d", (index % 28) + 1);
  }
}
