Here's the complete code for GoalGuru - AI Personal Goal Coach:

```typescript
// tech-stack.config.ts
export const techStack = {
  frontend: {
    framework: "Next.js 14.1.0",
    styling: "Tailwind CSS 3.4.1",
    components: "shadcn/ui",
    stateManagement: "React Context + Hooks"
  },
  backend: {
    runtime: "Next.js App Router API",
    database: "Firebase Firestore",
    auth: "Firebase Anonymous Auth",
    push: "Firebase Cloud Messaging (FCM)"
  },
  ai: {
    provider: "DeepSeek Chat API",
    features: ["Roadmap Generation", "Task Creation", "Roast Messages"]
  },
  deployment: {
    web: "Vercel",
    mobile: "Android WebView Wrapper",
    monitoring: "Vercel Analytics"
  }
};

// types/goal.ts
interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  roadmap: RoadmapStep[];
  currentStep: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: 'active' | 'completed' | 'abandoned';
}

// types/task.ts
interface Task {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: Timestamp;
  completedAt?: Timestamp;
}

// types/user.ts
interface User {
  id: string;
  name: string;
  language: 'en' | 'hi';
  gender: 'male' | 'female' | 'other';
  notificationTime: string;
  streakCount: number;
  lastActive: Timestamp;
  settings: {
    theme: 'light' | 'dark' | 'system';
    roastLevel: 'mild' | 'spicy' | 'extra-spicy';
    notifications: boolean;
  };
}

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  order: number;
  estimatedDays: number;
  status: 'pending' | 'active' | 'completed';
}

interface RoadmapResponse {
  steps: RoadmapStep[];
  totalDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// lib/ai/roadmap.ts
export async function generateRoadmap(
  goal: string, 
  userPreferences: UserPreferences
): Promise<RoadmapResponse> {
  const prompt = `
    Goal: ${goal}
    User Level: ${userPreferences.level}
    Timeline: ${userPreferences.timeline}
    Generate a structured roadmap with daily achievable tasks.
  `;

  const response = await deepseek.chat({
    prompt,
    temperature: 0.7,
    maxSteps: 30,
    format: 'structured'
  });

  return parseRoadmapResponse(response);
}

interface DailyTask {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'skipped';
  dueDate: Date;
  completedAt?: Date;
  streakImpact: boolean;
}

// lib/tasks/manager.ts
export class TaskManager {
  async createDailyTask(userId: string, goalId: string): Promise<DailyTask> {
    const roadmap = await this.getRoadmap(goalId);
    const nextStep = roadmap.steps.find(s => s.status === 'pending');
        
    return await db.collection('tasks').add({
      userId,
      goalId,
      title: nextStep.title,
      description: nextStep.description,
      status: 'pending',
      dueDate: new Date(),
      streakImpact: true,
      createdAt: serverTimestamp()
    });
  }

  async completeTask(taskId: string): Promise<void> {
    await db.collection('tasks').doc(taskId).update({
      status: 'completed',
      completedAt: serverTimestamp()
    });
  }
}

interface RoastConfig {
  language: 'en' | 'hi';
  gender: 'male' | 'female' | 'other';
  streak: number;
  level: 'mild' | 'spicy' | 'extra-spicy';
}

// lib/notifications/roast.ts
export class RoastNotificationService {
  async sendRoast(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    const todayTask = await this.getTodayTask(userId);

    if (todayTask.status === 'pending') {
      const roast = this.generateRoast({
        language: user.language,
        gender: user.gender,
        streak: user.streakCount,
        level: user.settings.roastLevel
      });

      await fcm.send({
        token: user.fcmToken,
        notification: {
          title: "Missing you already! 😢",
          body: roast,
          icon: "/icons/roast-128.png"
        },
        data: {
          taskId: todayTask.id,
          type: "roast"
        }
      });
    }
  }

  private generateRoast(config: RoastConfig): string {
    const roasts = {
      hi: {
        male: [
          "Bhai, goal complete karna hai ya nahi? 🤨",
          "Abe yaar, kab tak procrastinate karega? 😤",
          "Boss, Instagram scroll karna band kar! 📱"
        ],
        female: [
          "Didi, aaj ka task pending hai! 🤨",
          "Goal bhool gayi kya? Time to hustle! 💪",
          "Instagram reels baad mein, pehle task complete kar! 📱"
        ]
      },
      en: {
        neutral: [
          "Still waiting for those tasks to complete themselves? 🤔",
          "Your goals called, they miss you! 📱",
          "Netflix can wait, your dreams can't! 🎯"
        ]
      }
    };

    return this.selectRoast(roasts, config);
  }
}

// lib/streaks/tracker.ts
export class StreakTracker {
  async updateStreak(userId: string): Promise<number> {
    const tasks = await this.getUserTasks(userId, 30);
    let currentStreak = 0;
    let previousDate = new Date();

    for (const task of tasks) {
      const taskDate = task.completedAt.toDate();
      const daysDiff = this.calculateDaysDifference(previousDate, taskDate);

      if (daysDiff <= 1 && task.status === 'completed') {
        currentStreak++;
        previousDate = taskDate;
      } else {
        break;
      }
    }

    await this.updateUserStreak(userId, currentStreak);
    return currentStreak;
  }

  private calculateDaysDifference(date1: Date, date2: Date): number {
    return Math.floor(
      Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}

interface ProgressStats {
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  lastActive: Date;
}

// lib/analytics/progress.ts
export class ProgressAnalytics {
  async generateStats(userId: string): Promise<ProgressStats> {
    const tasks = await this.getUserTasks(userId);
    const streaks = await this.getStreakHistory(userId);

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      currentStreak: streaks.current,
      bestStreak: streaks.best,
      completionRate: this.calculateCompletionRate(tasks),
      lastActive: this.getLastActiveDate(tasks)
    };
  }
}
```