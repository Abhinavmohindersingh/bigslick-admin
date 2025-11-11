import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface GamePresenceCounts {
  "racing-suits": number;
  "space-crash": number;
  "stack-em": number;
  "poker-opoly": number;
}

interface GamePresenceContextType {
  presenceCounts: GamePresenceCounts;
}

const GamePresenceContext = createContext<GamePresenceContextType>({
  presenceCounts: {
    "racing-suits": 0,
    "space-crash": 0,
    "stack-em": 0,
    "poker-opoly": 0,
  },
});

export const GamePresenceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [presenceCounts, setPresenceCounts] = useState<GamePresenceCounts>({
    "racing-suits": 0,
    "space-crash": 0,
    "stack-em": 0,
    "poker-opoly": 0,
  });

  useEffect(() => {
    const channels: any[] = [];

    // Subscribe to each game's presence channel
    const gameIds: (keyof GamePresenceCounts)[] = [
      "racing-suits",
      "space-crash",
      "stack-em",
      "poker-opoly",
    ];

    gameIds.forEach((gameId) => {
      const channel = supabase.channel(`game-${gameId}`);

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const users = Object.values(state).flat();

          setPresenceCounts((prev) => ({
            ...prev,
            [gameId]: users.length,
          }));

          console.log(`${gameId} presence count:`, users.length);
        })
        .subscribe();

      channels.push(channel);
    });

    // Cleanup all channels
    return () => {
      channels.forEach((channel) => channel.unsubscribe());
    };
  }, []);

  return (
    <GamePresenceContext.Provider value={{ presenceCounts }}>
      {children}
    </GamePresenceContext.Provider>
  );
};

export const useGamePresence = () => {
  const context = useContext(GamePresenceContext);
  if (!context) {
    throw new Error("useGamePresence must be used within GamePresenceProvider");
  }
  return context;
};
