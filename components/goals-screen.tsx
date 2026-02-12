import { Colors } from '@/constants/theme';
import { deleteGoal, getGoals, rolloverGoal, saveGoal, updateGoal } from '@/utils/storage';
import { addDays, addMonths, addYears, format, isBefore, isSameDay, isSameMonth, isSameYear, startOfDay, startOfMonth, startOfYear, subDays, subMonths, subYears } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { AddGoalModal } from './add-goal-modal';
import { GoalCard } from './goal-card';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface GoalsScreenProps {
    type: 'day' | 'month' | 'year';
}

export const GoalsScreen = ({ type }: GoalsScreenProps) => {
    const [goals, setGoals] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const fetchGoals = useCallback(async () => {
        const allGoals = await getGoals();
        const filtered = allGoals.filter((g: any) => {
            const goalDate = new Date(g.date);
            if (g.type !== type) return false;

            if (type === 'day') return isSameDay(goalDate, currentDate);
            if (type === 'month') return isSameMonth(goalDate, currentDate);
            if (type === 'year') return isSameYear(goalDate, currentDate);
            return false;
        });
        setGoals(filtered);
    }, [type, currentDate]);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchGoals();
        setRefreshing(false);
    };

    const handleAddGoal = async (title: string, description: string) => {
        const newGoal = {
            title,
            description,
            status: 'todo',
            type,
            date: (type === 'day' ? startOfDay(currentDate) : type === 'month' ? startOfMonth(currentDate) : startOfYear(currentDate)).toISOString(),
        };
        await saveGoal(newGoal);
        fetchGoals();
    };

    const handleStatusChange = async (id: string, status: string) => {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            await updateGoal({ ...goal, status });
            fetchGoals();
        }
    };

    const handleDelete = async (id: string) => {
        await deleteGoal(id);
        fetchGoals();
    };

    const handlePrev = () => {
        if (type === 'day') setCurrentDate(subDays(currentDate, 1));
        else if (type === 'month') setCurrentDate(subMonths(currentDate, 1));
        else setCurrentDate(subYears(currentDate, 1));
    };

    const handleNext = () => {
        if (type === 'day') setCurrentDate(addDays(currentDate, 1));
        else if (type === 'month') setCurrentDate(addMonths(currentDate, 1));
        else setCurrentDate(addYears(currentDate, 1));
    };

    const getHeaderText = () => {
        if (type === 'day') return format(currentDate, 'EEEE, MMM do');
        if (type === 'month') return format(currentDate, 'MMMM yyyy');
        return format(currentDate, 'yyyy');
    };

    const isPreviousDate = () => {
        const now = new Date();
        if (type === 'day') return isBefore(startOfDay(currentDate), startOfDay(now));
        if (type === 'month') return isBefore(startOfMonth(currentDate), startOfMonth(now));
        if (type === 'year') return isBefore(startOfYear(currentDate), startOfYear(now));
        return false;
    };

    const handleRollover = async (id: string) => {
        const now = new Date();
        const newDate = (type === 'day' ? startOfDays(now) : type === 'month' ? startOfMonth(now) : startOfYear(now)).toISOString();
        await rolloverGoal(id, newDate);
        fetchGoals();
    };

    // Fix for potential missing startOfDays
    const startOfDays = (d: Date) => startOfDay(d);

    const handleGoToToday = () => {
        setCurrentDate(new Date());
    };

    const isCurrentPeriod = () => {
        const now = new Date();
        if (type === 'day') return isSameDay(currentDate, now);
        if (type === 'month') return isSameMonth(currentDate, now);
        if (type === 'year') return isSameYear(currentDate, now);
        return true;
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.dateHeaderContainer}>
                <View style={styles.dateHeader}>
                    <TouchableOpacity onPress={handlePrev}>
                        <ChevronLeft size={28} color={theme.tint} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={styles.dateText}>{getHeaderText()}</ThemedText>
                    <TouchableOpacity onPress={handleNext}>
                        <ChevronRight size={28} color={theme.tint} />
                    </TouchableOpacity>
                </View>
                {!isCurrentPeriod() && (
                    <TouchableOpacity onPress={handleGoToToday} style={styles.goToTodayContainer}>
                        <ThemedText style={[styles.goToTodayText, { color: theme.tint }]}>
                            Go to Today
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={goals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <GoalCard
                        goal={item}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        onRollover={handleRollover}
                        showRollover={isPreviousDate() && item.status !== 'done'}
                    />
                )}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <ThemedText style={styles.emptyText}>No goals set for this {type}.</ThemedText>
                        <ThemedText style={styles.emptySubText}>A journey of a thousand miles begins with a single step.</ThemedText>
                    </View>
                }
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.tint }]}
                onPress={() => setModalVisible(true)}
            >
                <Plus size={32} color="#FFF" />
            </TouchableOpacity>

            <AddGoalModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleAddGoal}
                type={type}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dateHeaderContainer: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    dateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    dateText: {
        fontSize: 20,
        fontWeight: '600',
    },
    goToTodayContainer: {
        alignItems: 'center',
        paddingBottom: 12,
    },
    goToTodayText: {
        fontSize: 14,
        fontWeight: '500',
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    empty: {
        marginTop: 60,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        opacity: 0.7,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        opacity: 0.5,
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
});
