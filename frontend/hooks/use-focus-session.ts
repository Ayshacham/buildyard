import { useRef, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
	endFocusSession,
	pauseFocusSession,
	startFocusSession,
	resumeFocusSession,
	postSessionHeartbeat,
} from '@/lib/api/sessions';
import { getApiErrorMessage } from '@/lib/api/errors';
import { formatMinutesSeconds } from '@/lib/timer-display';
import type {
	ActiveSessionResponse,
	FocusSessionApi,
	TimerStateApi,
} from '@/lib/api/types';

import { queryKeys } from '@/queries/keys';
import { sessionsQueries } from '@/queries/sessions';

function invalidateDashboardData(queryClient: ReturnType<typeof useQueryClient>) {
	queryClient.invalidateQueries({ queryKey: queryKeys.accounts.me() });
	queryClient.invalidateQueries({ queryKey: queryKeys.accounts.streak() });
	queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
}

export function useFocusSession({
	focusDurationMinutes,
	defaultProjectId,
}: {
	focusDurationMinutes: number;
	defaultProjectId?: string;
}) {
	const queryClient = useQueryClient();
	const activeQuery = useQuery(sessionsQueries.active());

	const timer = activeQuery.data?.timer ?? null;
	const plannedSeconds = timer?.planned_seconds ?? 0;

	const [localElapsedSeconds, setLocalElapsedSeconds] = useState(0);
	const localElapsedRef = useRef(0);
	useEffect(() => {
		localElapsedRef.current = localElapsedSeconds;
	}, [localElapsedSeconds]);

	const lastTimerIdRef = useRef<string | null>(null);

	useEffect(() => {
		if (!timer) {
			lastTimerIdRef.current = null;
			queueMicrotask(() => {
				setLocalElapsedSeconds(0);
			});
			return;
		}
		if (lastTimerIdRef.current === timer.id) return;
		lastTimerIdRef.current = timer.id;

		const applySync = () => {
			if (timer.is_paused) {
				setLocalElapsedSeconds(timer.elapsed_seconds);
				return;
			}
			const driftSeconds = timer.last_tick_at
				? Math.floor(
					(Date.now() - new Date(timer.last_tick_at).getTime()) / 1000,
				)
				: 0;
			setLocalElapsedSeconds(timer.elapsed_seconds + driftSeconds);
		};
		queueMicrotask(applySync);
	}, [timer]);

	useEffect(() => {
		if (!timer?.is_running || timer.is_paused) return;
		const intervalId = window.setInterval(() => {
			setLocalElapsedSeconds((elapsed) => elapsed + 1);
		}, 1000);
		return () => window.clearInterval(intervalId);
	}, [timer?.is_running, timer?.is_paused, timer?.id]);

	useEffect(() => {
		if (!timer?.is_running || timer.is_paused) return;
		const intervalId = window.setInterval(() => {
			const elapsed = localElapsedRef.current;
			void postSessionHeartbeat(elapsed)
				.then((updatedTimer: TimerStateApi) => {
					queryClient.setQueryData(
						queryKeys.sessions.active(),
						(previous: ActiveSessionResponse | undefined) => ({
							timer: updatedTimer,
							session:
								previous?.session ?? updatedTimer.session ?? null,
						}),
					);
				})
				.catch(() => { });
		}, 30000);
		return () => window.clearInterval(intervalId);
	}, [timer?.is_running, timer?.is_paused, timer?.id, queryClient]);

	const startMutation = useMutation({
		mutationFn: () =>
			startFocusSession({
				planned_duration_minutes: focusDurationMinutes,
				...(defaultProjectId ? { project_id: defaultProjectId } : {}),
			}),
		onSuccess: (data) => {
			lastTimerIdRef.current = null;
			queryClient.setQueryData(queryKeys.sessions.active(), {
				timer: data.timer,
				session: data.session,
			});
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error));
		},
	});

	const endMutation = useMutation({
		mutationFn: (elapsedSeconds: number) =>
			endFocusSession({ elapsed_seconds: elapsedSeconds }),
		onSuccess: (session: FocusSessionApi) => {
			lastTimerIdRef.current = null;
			queryClient.setQueryData(queryKeys.sessions.active(), {
				timer: null,
				session: null,
			});
			setLocalElapsedSeconds(0);
			invalidateDashboardData(queryClient);
			if (session.overrun_minutes > 0) {
				toast.message('Past your planned block', {
					description: `You went about ${session.overrun_minutes} minutes over. Consider a short break before the next focus block.`,
				});
			}
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error));
		},
	});

	const pauseMutation = useMutation({
		mutationFn: (elapsedSeconds: number) =>
			pauseFocusSession({ elapsed_seconds: elapsedSeconds }),
		onSuccess: (updatedTimer: TimerStateApi) => {
			queryClient.setQueryData(
				queryKeys.sessions.active(),
				(previous: ActiveSessionResponse | undefined) => ({
					timer: updatedTimer,
					session:
						previous?.session ?? updatedTimer.session ?? null,
				}),
			);
			setLocalElapsedSeconds(updatedTimer.elapsed_seconds);
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error));
		},
	});

	const resumeMutation = useMutation({
		mutationFn: resumeFocusSession,
		onSuccess: (updatedTimer: TimerStateApi) => {
			queryClient.setQueryData(
				queryKeys.sessions.active(),
				(previous: ActiveSessionResponse | undefined) => ({
					timer: updatedTimer,
					session:
						previous?.session ?? updatedTimer.session ?? null,
				}),
			);
			setLocalElapsedSeconds(updatedTimer.elapsed_seconds);
		},
		onError: (error: unknown) => {
			toast.error(getApiErrorMessage(error));
		},
	});

	const start = useCallback(() => {
		startMutation.mutate();
	}, [startMutation]);

	const end = useCallback(() => {
		endMutation.mutate(localElapsedRef.current);
	}, [endMutation]);

	const pause = useCallback(() => {
		pauseMutation.mutate(localElapsedRef.current);
	}, [pauseMutation]);

	const resume = useCallback(() => {
		resumeMutation.mutate();
	}, [resumeMutation]);

	const isBusy =
		startMutation.isPending ||
		endMutation.isPending ||
		pauseMutation.isPending ||
		resumeMutation.isPending;

	const remainingSeconds =
		timer && plannedSeconds > 0
			? Math.max(0, plannedSeconds - localElapsedSeconds)
			: 0;

	const progressFraction =
		timer && plannedSeconds > 0
			? Math.min(1, localElapsedSeconds / plannedSeconds)
			: 0;

	const overtimeSeconds =
		timer && plannedSeconds > 0
			? Math.max(0, localElapsedSeconds - plannedSeconds)
			: 0;

	const timeLabel =
		timer && plannedSeconds > 0
			? localElapsedSeconds < plannedSeconds
				? formatMinutesSeconds(remainingSeconds)
				: `+${formatMinutesSeconds(overtimeSeconds)}`
			: formatMinutesSeconds(0);

	return {
		timer,
		session: activeQuery.data?.session ?? timer?.session ?? null,
		remainingSeconds,
		progressFraction,
		timeLabel,
		isLoadingActive: activeQuery.isPending,
		isBusy,
		hasActiveSession: Boolean(timer),
		isRunning: Boolean(timer?.is_running && !timer?.is_paused),
		isPaused: Boolean(timer?.is_paused),
		start,
		end,
		pause,
		resume,
	};
}
