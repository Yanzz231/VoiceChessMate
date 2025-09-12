const API_BASE_URL = "https://voicechessmatebe-production.up.railway.app/api";

interface CreateUserRequest {
  user_id: string;
}

interface CreateUserResponse {
  success: boolean;
  message?: string;
  user?: any;
}

interface GameResponse {
  data: {
    game_id: string;
  };
}

interface MoveRequest {
  move: string;
  fen: string;
  bot_level: string;
}

interface MoveResponse {
  success: boolean;
  data?: {
    bot_move: string;
    fen: string;
  };
  message?: string;
}

class UserService {
  async createUser(userId: string): Promise<CreateUserResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      return {
        success: false,
        message: "Failed to create user account",
      };
    }
  }

  async createGame(userId: string): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/gameplay/${userId}/game`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GameResponse = await response.json();
      return data.data.game_id;
    } catch (error) {
      return null;
    }
  }

  async makeMove(
    gameId: string,
    move: string,
    fen: string,
    botLevel: string
  ): Promise<MoveResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/gameplay/game/${gameId}/move`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            move: move === "" ? "black" : move,
            fen,
            bot_level: botLevel,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      return {
        success: false,
        message: "Failed to make move " + error,
      };
    }
  }
}

export const userService = new UserService();
export type {
  CreateUserRequest,
  CreateUserResponse,
  GameResponse,
  MoveRequest,
  MoveResponse,
};
