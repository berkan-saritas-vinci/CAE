import { useState } from 'react';
import type { MatchResultDto } from '../types';

export const useManageMatch = (
  adminEncode: (matchId: number, dto: MatchResultDto) => Promise<void>,
) => {
  const [score1, setScore1] = useState<number>(0);
  const [score2, setScore2] = useState<number>(0);

  const handleAdminEncode = async (
    matchId: number,
    administratorId: number,
  ) => {
    if (score1 === score2) {
      throw new Error('Un match nul ne peut pas etre encode.');
    }

    const dto: MatchResultDto = {
      resultTeam1: score1,
      resultTeam2: score2,
      administratorId,
    };
    await adminEncode(matchId, dto);
  };

  return {
    score1,
    setScore1,
    score2,
    setScore2,
    handleAdminEncode,
  };
};
