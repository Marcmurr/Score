
export interface Mission {
  id: string;
  name: string;
  description: string;
}

export const PRIMARY_MISSIONS: Mission[] = [
  {
    id: 'p1-2026',
    name: 'Take and Hold',
    description: 'In the second, third, and fourth battle round: At the end of each Command phase, the player whose turn it is scores 5VP for each objective marker they control (up to 15VP per turn). In the fifth battle round, the player going second scores at the end of their turn instead.'
  },
  {
    id: 'p2-2026',
    name: 'Scorched Earth',
    description: 'From the second battle round, units can perform an action to Burn an objective marker they control, removing it from the battlefield. Score 5VP per turn for controlling objectives. At the end of the battle, score 5VP for each burned objective in No Man\'s Land, and 10VP for burning the objective in the opponent\'s deployment zone.'
  },
  {
    id: 'p3-2026',
    name: 'Purge the Foe',
    description: 'At the end of each Command phase (from round 2), score 4VP for controlling one or more objective markers, and an extra 4VP for controlling more than the opponent. At the end of the battle round, score 4VP if an enemy unit was destroyed, and an extra 4VP if more enemy units than friendly units were destroyed.'
  },
  {
    id: 'p4-2026',
    name: 'Hidden Supplies',
    description: 'An extra objective marker is placed in the center of the battlefield, altering the map layout. Players score by prioritizing objectives in No Man\'s Land and the newly placed center objective, heavily altering standard primary scoring cadences.'
  },
  {
    id: 'p5-2026',
    name: 'Linchpin',
    description: 'At the end of each player\'s Command phase, the player whose turn it is scores 5VP for each objective marker they control (up to 15VP per turn). However, they cannot score more than 10VP unless they control one or more objective markers in No Man\'s Land.'
  },
  {
    id: 'p6-2026',
    name: 'Supply Drop',
    description: 'Objective markers are progressively removed from the battlefield as the game continues. Early rounds score normally, but by the fifth battle round, players must fight over the few remaining active objective markers.'
  },
  {
    id: 'p7-2026',
    name: 'Terraform',
    description: 'Units can perform an action to Terraform an objective marker they control. Objective markers that have been Terraformed remain Terraformed for the rest of the battle (even if claimed by an opponent), altering how VP is scored.'
  },
  {
    id: 'p8-2026',
    name: 'Burden of Trust',
    description: 'Score VP for guarding objective markers you control. The player going first can score at the end of their opponent\'s 1st, 2nd, 3rd, 4th, and 5th turn. The player going second can score at the end of their opponent\'s 2nd, 3rd, 4th, and 5th turn.'
  }
];

export const SECONDARY_MISSIONS: Mission[] = [
  {
    id: 's1-2026',
    name: 'Assassination',
    description: 'Score 4VP at the end of the battle (or end of your turn if using Tactical Missions) for each enemy CHARACTER unit that was destroyed. If the enemy Warlord was destroyed, score 1 extra VP.'
  },
  {
    id: 's2-2026',
    name: 'Bring It Down',
    description: 'Score VP for each enemy MONSTER or VEHICLE unit destroyed, scaling with the Wounds characteristic of the destroyed unit. Score an additional 2VP if the destroyed unit was a TITANIC unit.'
  },
  {
    id: 's3-2026',
    name: 'Cleanse',
    description: 'Action: One or more units from your army can start this action at the end of your Shooting phase. Each unit must be within range of a different objective marker you control that is not in your deployment zone. Score 2VP for each objective marker cleansed (max 4VP).'
  },
  {
    id: 's4-2026',
    name: 'Establish Locus',
    description: 'Action: One unit from your army can start this action at the end of your Movement phase if it is wholly within your opponent\'s deployment zone or within 6" of the center of the battlefield. Score 2VP if completed near the center, or 4VP if in the opponent\'s deployment zone.'
  },
  {
    id: 's5-2026',
    name: 'Storm Hostile Objective',
    description: 'Score 4VP at the end of your turn if you control an objective marker that was controlled by your opponent at the start of your turn. Score 8VP instead if you control two or more such objective markers.'
  },
  {
    id: 's6-2026',
    name: 'Engage on All Fronts',
    description: 'Score VP at the end of your turn if you have units wholly within 3 different table quarters and those units are more than 6" from the center of the battlefield. Score extra VP if you have units wholly within all 4 table quarters.'
  },
  {
    id: 's7-2026',
    name: 'Cull the Horde',
    description: 'Score 5VP at the end of your turn if you destroyed at least one enemy INFANTRY unit that had a Starting Strength of 20 or more models, or if you destroyed at least two enemy INFANTRY units that had a Starting Strength of 10-19 models.'
  },
  {
    id: 's8-2026',
    name: 'Marked for Death',
    description: 'Target enemy units to destroy. You must destroy the Bodyguard unit and at least one Leader unit attached to it to score VP. If the target is unreachable, a fallback target can be named for 2 VP.'
  },
  {
    id: 's9-2026',
    name: 'Overwhelming Force',
    description: 'Score VP if you destroyed more enemy units than you lost friendly units this turn. If a Leader wasn\'t on the objective but the unit was, and you kill both separately, you get two units toward scoring.'
  },
  {
    id: 's10-2026',
    name: 'No Prisoners',
    description: 'Score 2VP at the end of your turn for each enemy unit destroyed this turn. If you destroyed 3 or more enemy units this turn, score an additional 1VP.'
  },
  {
    id: 's11-2026',
    name: 'Extend Battle Lines',
    description: 'Score 4VP at the end of your turn if you control your home objective marker and at least one objective marker in No Man\'s Land.'
  },
  {
    id: 's12-2026',
    name: 'Containment',
    description: 'Action: One unit from your army can start this action at the end of your Movement phase if it is wholly within 9" of a battlefield edge and not in your own deployment zone. The action is completed at the end of your turn.'
  },
  {
    id: 's13-2026',
    name: 'Sabotage',
    description: 'Action: One unit from your army can start this action at the end of your Movement phase. Only your unit must not be within your deployment zone to start performing the Sabotage Action on a terrain feature. Score 6VP.'
  }
];
