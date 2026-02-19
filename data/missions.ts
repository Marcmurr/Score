
export interface Mission {
  id: string;
  name: string;
  description: string;
}

export const PRIMARY_MISSIONS: Mission[] = [
  {
    id: 'p1-2026',
    name: 'Take and Hold',
    description: 'At the end of each player\'s Command phase, the player whose turn it is scores 5VP for each objective marker they control (up to 15VP per turn).'
  },
  {
    id: 'p2-2026',
    name: 'Scorched Earth',
    description: 'At the end of each player\'s Command phase, the player whose turn it is scores 5VP for each objective marker they control (up to 10VP per turn). From the second battle round onwards, units can perform an action to Burn an objective marker they control. At the end of the battle, score 5VP for each objective marker in No Man\'s Land that was burned, and 10VP for the objective marker in the opponent\'s deployment zone if it was burned.'
  },
  {
    id: 'p3-2026',
    name: 'Purge the Foe',
    description: 'At the end of each player\'s Command phase, the player whose turn it is scores 4VP if they control one or more objective markers, and an extra 4VP if they control more objective markers than their opponent. At the end of the battle round, each player scores 4VP if one or more enemy units were destroyed this battle round, and an extra 4VP if more enemy units were destroyed than friendly units.'
  },
  {
    id: 'p4-2026',
    name: 'Linchpin',
    description: 'At the end of each player\'s Command phase, the player whose turn it is scores 5VP for each objective marker they control (up to 15VP per turn). However, they cannot score more than 10VP unless they control one or more objective markers in No Man\'s Land.'
  },
  {
    id: 'p5-2026',
    name: 'Terraform',
    description: 'At the end of each player\'s Command phase, the player whose turn it is scores 5VP for each objective marker they control (up to 15VP per turn). Units can perform an action to Terraform an objective marker they control. Objective markers that have been Terraformed remain Terraformed for the rest of the battle. Scoring may be tied to controlling Terraformed objectives in specific mission rules.'
  },
  {
    id: 'p6-2026',
    name: 'Burden of Trust',
    description: 'At the end of each player\'s Command phase, the player whose turn it is scores 5VP for each objective marker they control (up to 15VP per turn). If a player controls an objective marker at the end of their Command phase and they have a Battleline unit within range of it, that objective marker remains under their control even if they have no models within range of it, until their opponent controls it.'
  },
  {
    id: 'p7-2026',
    name: 'Unexploded Ordnance',
    description: 'At the end of each player\'s Command phase, the player whose turn it is scores 5VP for each objective marker they control (up to 15VP per turn). In addition, units can perform an action to move an objective marker up to 6" horizontally.'
  },
  {
    id: 'p8-2026',
    name: 'Supply Drop',
    description: 'At the start of the battle, the objective marker in the center is Alpha, and the others are Omega. At the start of the fourth battle round, the Alpha objective marker is removed. At the start of the fifth battle round, all objective markers in No Man\'s Land are removed except one chosen randomly. At the end of each player\'s Command phase, the player whose turn it is scores 5VP for each objective marker they control (up to 15VP per turn).'
  },
  {
    id: 'p9-2026',
    name: 'The Ritual',
    description: 'At the end of each player\'s Command phase, the player whose turn it is scores 5VP for each objective marker they control (up to 15VP per turn). Additionally, characters can perform an action to set up a new objective marker. At the end of the battle, players score VP for these created objective markers.'
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
    description: 'Score 2VP for each enemy MONSTER or VEHICLE unit destroyed with a Wounds characteristic of 1-9. Score 3VP for each enemy MONSTER or VEHICLE unit destroyed with a Wounds characteristic of 10+. Score 2VP additional if the destroyed unit was a TITANIC unit.'
  },
  {
    id: 's3-2026',
    name: 'Cleanse',
    description: 'Action: One or more units from your army can start this action at the end of your Shooting phase. Each unit must be within range of a different objective marker you control that is not in your deployment zone. The action is completed at the end of your turn. Score 2VP for each objective marker cleansed (max 4VP).'
  },
  {
    id: 's4-2026',
    name: 'Establish Locus',
    description: 'Action: One unit from your army can start this action at the end of your Movement phase if it is wholly within your opponent\'s deployment zone or within 6" of the center of the battlefield. The action is completed at the end of your turn. Score 2VP if completed near the center, or 4VP if completed in the opponent\'s deployment zone.'
  },
  {
    id: 's5-2026',
    name: 'Storm Hostile Objective',
    description: 'Score 4VP at the end of your turn if you control an objective marker that was controlled by your opponent at the start of your turn. Score 8VP instead if you control two or more such objective markers.'
  },
  {
    id: 's6-2026',
    name: 'Area Denial',
    description: 'Score 5VP at the end of your turn if you have one or more units wholly within 6" of the center of the battlefield, and there are no enemy units wholly within 6" of the center of the battlefield.'
  },
  {
    id: 's7-2026',
    name: 'Behind Enemy Lines',
    description: 'Score 3VP at the end of your turn if you have two or more units wholly within your opponent\'s deployment zone. Score 4VP instead if you have two or more units wholly within your opponent\'s deployment zone and one of them is a CHARACTER.'
  },
  {
    id: 's8-2026',
    name: 'Extend Battle Lines',
    description: 'Score 5VP at the end of your turn if you control your home objective marker and at least one objective marker in No Man\'s Land.'
  },
  {
    id: 's9-2026',
    name: 'No Prisoners',
    description: 'Score 2VP at the end of your turn for each enemy unit destroyed this turn. If you destroyed 3 or more enemy units this turn, score an additional 1VP.'
  },
  {
    id: 's10-2026',
    name: 'Recover Assets',
    description: 'Action: Two or more units from your army can start this action at the end of your Shooting phase. Each unit must be wholly within a different table quarter and more than 6" from the center of the battlefield. The action is completed at the end of your opponent\'s next turn. Score 2VP for each unit that completed the action.'
  },
  {
    id: 's11-2026',
    name: 'Sabotage',
    description: 'Action: One unit from your army can start this action at the end of your Movement phase if it is within a terrain feature that is wholly or partially within your opponent\'s territory (but not wholly within their deployment zone). The action is completed at the end of your turn. Score 6VP.'
  },
  {
    id: 's12-2026',
    name: 'Cull the Horde',
    description: 'Score 5VP at the end of your turn if you destroyed at least one enemy INFANTRY unit that had a Starting Strength of 20 or more models, or if you destroyed at least two enemy INFANTRY units that had a Starting Strength of 10-19 models.'
  },
  {
    id: 's13-2026',
    name: 'Marked for Death',
    description: 'At the start of the battle (or when this card is drawn), your opponent selects three units from their army. Score 5VP for each of those units that is destroyed.'
  },
  {
    id: 's14-2026',
    name: 'Overwhelming Force',
    description: 'Score 3VP at the end of your turn if you destroyed more enemy units than you lost friendly units this turn. Score an additional 2VP if you destroyed at least three enemy units this turn.'
  },
  {
    id: 's15-2026',
    name: 'Secure No Man\'s Land',
    description: 'Score 2VP at the end of your turn if you control at least one objective marker in No Man\'s Land. Score 5VP instead if you control at least two objective markers in No Man\'s Land.'
  },
  {
    id: 's16-2026',
    name: 'Containment',
    description: 'Action: One unit from your army can start this action at the end of your Movement phase if it is wholly within 9" of a battlefield edge and not in your own deployment zone. The action is completed at the end of your turn. Score 3VP for each different battlefield edge (excluding your own deployment edge) where you completed this action.'
  },
  {
    id: 's17-2026',
    name: 'Defend Stronghold',
    description: 'Score 3VP at the end of your turn if you control the objective marker in your own deployment zone. Score an additional 2VP if you also control at least one objective marker in No Man\'s Land.'
  },
  {
    id: 's18-2026',
    name: 'Engage on All Fronts',
    description: 'Score 2VP at the end of your turn if you have units wholly within 3 different table quarters and those units are more than 6" from the center of the battlefield. Score 4VP instead if you have units wholly within all 4 table quarters.'
  }
];
