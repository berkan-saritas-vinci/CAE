package be.vinci.cae.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.Date;

/**
 * Entity representing a tournament.
 */
@Entity
@Table(name = "tournament")
public class Tournament {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String nom;

  private String description;

  @JsonProperty("date_debut")
  @JsonFormat(pattern = "yyyy-MM-dd")
  @Column(name = "date_debut")
  private Date dateDebut;

  @JsonProperty("date_fin")
  @JsonFormat(pattern = "yyyy-MM-dd")
  @Column(name = "date_fin")
  private Date dateFin;

  @JsonProperty("date_fin_inscription")
  @JsonFormat(pattern = "yyyy-MM-dd")
  @Column(name = "date_fin_inscription")
  private Date dateFinInscription;

  private String etat;

  private Long nbrTeam;

  private Long nbrTeamInscrite;

  @ManyToOne
  @Nullable
  @JoinColumn(name = "gagnant_id")
  private Team gagnant;

  public Date getDateDebut() {
    return dateDebut;
  }

  public void setDateDebut(Date dateDebut) {
    this.dateDebut = dateDebut;
  }

  public Date getDateFin() {
    return dateFin;
  }

  public void setDateFin(Date dateFin) {
    this.dateFin = dateFin;
  }

  public Date getDateFinInscription() {
    return dateFinInscription;
  }

  public void setDateFinInscription(Date dateFinInscription) {
    this.dateFinInscription = dateFinInscription;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getEtat() {
    return etat;
  }

  public void setEtat(String etat) {
    this.etat = etat;
  }

  @Nullable
  public Team getGagnant() {
    return gagnant;
  }

  public void setGagnant(@Nullable Team gagnant) {
    this.gagnant = gagnant;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getNbrTeam() {
    return nbrTeam;
  }

  public void setNbrTeam(Long nbrTeam) {
    this.nbrTeam = nbrTeam;
  }

  public Long getNbrTeamInscrite() {
    return nbrTeamInscrite;
  }

  public void setNbrTeamInscrite(Long nbrTeamInscrite) {
    this.nbrTeamInscrite = nbrTeamInscrite;
  }

  public String getNom() {
    return nom;
  }

  public void setNom(String nom) {
    this.nom = nom;
  }
}
