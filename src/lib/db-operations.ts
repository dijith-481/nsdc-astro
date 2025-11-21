import { db } from "./firebase";
import type { TeamYear, TeamMember } from "../types";

export async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  if (!db) return [];
  try {
    const snapshot = await db.collection(collectionName).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T);
  } catch (error) {
    console.error(`Error fetching collection "${collectionName}":`, error);
    return [];
  }
}

export async function fetchTeams(): Promise<TeamYear[]> {
  if (!db) return [];
  try {
    const yearsSnapshot = await db.collection("teams").get();

    const teamsData = await Promise.all(
      yearsSnapshot.docs.map(async (yearDoc) => {
        const yearData = yearDoc.data();

        const membersSnapshot = await db!
          .collection(`teams/${yearDoc.id}/team`)
          .get();

        const members = membersSnapshot.docs.map(
          (memberDoc) =>
            ({
              id: memberDoc.id,
              ...memberDoc.data(),
            }) as TeamMember,
        );

        return {
          id: yearDoc.id,
          title: yearData.title,
          members,
        } as TeamYear;
      }),
    );

    teamsData.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    teamsData.forEach((team) => {
      team.members.sort((a, b) => a.priority - b.priority);
    });

    return teamsData;
  } catch (error) {
    console.error(`Error fetching nested teams data:`, error);
    return [];
  }
}

export async function fetchShortUrls() {
  if (!db) return [];
  try {
    const snapshot = await db.collection("short_urls").get();
    return snapshot.docs.map((doc) => ({
      slug: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching short_urls:", error);
    return [];
  }
}
