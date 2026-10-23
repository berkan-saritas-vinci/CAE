interface LoginContext {
  loginUser: (user: User, rememberMe: boolean) => Promise<void>;
  authenticatedUser?: AuthenticatedUser;
}
interface RegisterContext {
  registerUser: (NewUser: RegisterUser) => Promise<void>;
}

interface User {
  mail: string;
  password: string;
  id?: number;
  role?: string;
}
interface AuthenticatedUser {
  id: number;
  mail: string;
  password: string;
  token: string;
  tag: string;
  picture: string;
  speciality: Speciality;
  team?: number;
  createdAt?: string;
  role?: string;
}
type MaybeAuthenticatedUser = AuthenticatedUser | undefined;
interface RegisterUser {
  picture: Picture;
  mail: string;
  password: string;
  tag: string;
  speciality: Speciality;
}
type NewUser = Omit<RegisterUser, 'id'>;
interface Picture {}
interface Speciality {}

interface Indisponibility {
  id: number;
  startDate: string;
  endDate: string;
}

interface IndisponibilityContextType {
  periods: Indisponibility[];
  getAllPeriods: () => Promise<void>;
  addPeriod: (startDate: string, endDate: string) => Promise<void>;
  deletePeriod: (id: number) => Promise<void>;
}
interface Team {
  id: number;
  name: string;
  responsable: string;
  secondResponsable?: string;
  members?: Member[];
}

type TeamResponse = {
  id: number;
  name?: string;
  responsable?: number;
};

interface NewTeam {
  name: string;
  responsable: number;
}

interface Member {
  id: number;
  username: string;
  role: string;
}

interface Notification {
  id: number;
  message: string;
  date: string;
  lu: boolean;
  user: User;
}

interface DemandeAdhesion {
  id: number;
  statut: string;
  motifRefus?: string;
  user: {
    id: number;
    mail: string;
    tag?: string;
    role?: string;
  };
  team: {
    id: number;
    name: string;
  };
}

interface TeamMember {
  picture: string;
  id: number;
  tag?: string;
  mail: string;
  role: string;
  speciality?: {
    name: string;
  };
}

interface Tournament {
  id: number;
  nom: string;
  description: string;
  date_debut: string;
  date_fin: string;
  date_fin_inscription: string;
  etat: string;
  nbrTeam: number;
  nbrTeamInscrite?: number;
  gagnant?: TeamResponse | null;
}

interface Match {
  id: number;
  tournament: number;
  team1?: Team;
  team2?: Team;
  turn: number;
  status: string;
  administrator?: {
    id: number;
    mail: string;
    tag: string;
  } | null;
  resultTeam1?: number;
  resultTeam2?: number;
  dateTime: string;
  team1Validated?: boolean;
  team2Validated?: boolean;
  team1contested?: boolean;
  team2contested?: boolean;
}

interface TeamValidationDto {
  teamId: number;
  validated: boolean;
}

interface MatchResultDto {
  resultTeam1?: number;
  resultTeam2?: number;
  forfeitingTeamId?: number;
  administratorId?: number;
}

interface Selection {
  id: number;
  user?: {
    id: number;
    tag?: string;
    mail: string;
    speciality?: string;
  };
  team?: {
    id: number;
  };
}

type NewTournament = Omit<Tournament, 'id'>;

export type {
  Team,
  NewTeam,
  Member,
  RegisterUser,
  User,
  NewUser,
  AuthenticatedUser,
  MaybeAuthenticatedUser,
  RegisterContext,
  LoginContext,
  Picture,
  Speciality,
  Indisponibility,
  IndisponibilityContextType,
  Notification,
  DemandeAdhesion,
  TeamMember,
  Tournament,
  NewTournament,
  TeamResponse,
  Match,
  TeamValidationDto,
  MatchResultDto,
  Selection,
};
