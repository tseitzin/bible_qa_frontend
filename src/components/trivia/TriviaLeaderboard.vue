<template>
  <div class="leaderboard">
    <div class="leaderboard-header">
      <h3 class="leaderboard-title">Leaderboard</h3>
      <span class="leaderboard-period">{{ periodLabel }}</span>
    </div>

    <div v-if="!entries.length" class="leaderboard-empty">
      No entries yet for this category and difficulty.
    </div>

    <table v-else class="leaderboard-table">
      <thead>
        <tr>
          <th class="col-rank">Rank</th>
          <th class="col-user">Player</th>
          <th class="col-score">Best Score</th>
          <th class="col-accuracy">Accuracy</th>
          <th class="col-games">Games</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(entry, idx) in entries"
          :key="entry.user_id ?? idx"
          class="leaderboard-row"
          :class="{ 'leaderboard-row--you': userRank && idx + 1 === userRank }"
        >
          <td class="col-rank">
            <span class="rank-badge" :class="rankClass(idx + 1)">
              {{ rankDisplay(idx + 1) }}
            </span>
          </td>
          <td class="col-user">
            <span class="username">{{ entry.username ?? 'Anonymous' }}</span>
            <span v-if="userRank && idx + 1 === userRank" class="you-label">You</span>
          </td>
          <td class="col-score">{{ entry.best_score ?? entry.score ?? '—' }}</td>
          <td class="col-accuracy">
            {{ entry.accuracy != null ? Math.round(entry.accuracy) + '%' : '—' }}
          </td>
          <td class="col-games">{{ entry.games_played ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  },
  userRank: {
    type: Number,
    default: null
  },
  period: {
    type: String,
    default: 'all_time'
  }
})

const periodLabel = computed(() =>
  props.period === 'weekly' ? 'This Week' : 'All Time'
)

function rankDisplay(rank) {
  if (rank === 1) return '&#x1F947;'  // gold medal
  if (rank === 2) return '&#x1F948;'  // silver medal
  if (rank === 3) return '&#x1F949;'  // bronze medal
  return rank
}

function rankClass(rank) {
  if (rank === 1) return 'rank-badge--gold'
  if (rank === 2) return 'rank-badge--silver'
  if (rank === 3) return 'rank-badge--bronze'
  return ''
}
</script>

<style scoped>
.leaderboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.leaderboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.leaderboard-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.leaderboard-period {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  background: var(--color-highlight);
  padding: 2px var(--spacing-sm);
  border-radius: 9999px;
}

.leaderboard-empty {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  padding: var(--spacing-xl);
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

.leaderboard-table th {
  text-align: left;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-soft);
}

.leaderboard-row td {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-soft);
  color: var(--color-text-primary);
  vertical-align: middle;
}

.leaderboard-row:last-child td {
  border-bottom: none;
}

.leaderboard-row--you {
  background: var(--color-highlight);
}

.leaderboard-row--you td {
  font-weight: var(--font-weight-semibold);
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  background: var(--color-background-alt, #e9e9e7);
  color: var(--color-text-muted);
}

.rank-badge--gold {
  background: rgba(245, 165, 36, 0.2);
  font-size: 1rem;
  color: transparent; /* emoji fills it */
}

.rank-badge--silver {
  background: rgba(156, 163, 175, 0.2);
  font-size: 1rem;
  color: transparent;
}

.rank-badge--bronze {
  background: rgba(180, 120, 80, 0.15);
  font-size: 1rem;
  color: transparent;
}

.username {
  font-weight: var(--font-weight-medium);
}

.you-label {
  display: inline-block;
  margin-left: var(--spacing-xs);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  background: var(--color-highlight);
  padding: 1px 6px;
  border-radius: 9999px;
}

.col-rank { width: 52px; }
.col-score,
.col-accuracy,
.col-games {
  text-align: right;
}

.leaderboard-table th.col-score,
.leaderboard-table th.col-accuracy,
.leaderboard-table th.col-games {
  text-align: right;
}

@media (max-width: 480px) {
  .col-games {
    display: none;
  }

  .leaderboard-table th.col-games {
    display: none;
  }
}
</style>
