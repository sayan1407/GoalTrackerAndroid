import { Colors } from '@/constants/theme';
import { ArrowRight, CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Goal {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'done';
    type: 'day' | 'month' | 'year';
    date: string;
}

interface GoalCardProps {
    goal: Goal;
    onStatusChange: (id: string, status: Goal['status']) => void;
    onDelete: (id: string) => void;
    onRollover?: (id: string) => void;
    showRollover?: boolean;
    readonly?: boolean;
}

export const GoalCard = ({ goal, onStatusChange, onDelete, onRollover, showRollover, readonly }: GoalCardProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const getStatusIcon = () => {
        switch (goal.status) {
            case 'done':
                return <CheckCircle2 size={24} color={theme.done} />;
            case 'in-progress':
                return <Clock size={24} color={theme.inProgress} />;
            default:
                return <Circle size={24} color={theme.todo} />;
        }
    };

    const nextStatus = () => {
        if (goal.status === 'todo') return 'in-progress';
        if (goal.status === 'in-progress') return 'done';
        return 'todo';
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: theme.card }]}>
            <TouchableOpacity
                style={[styles.statusButton, readonly && styles.disabledButton]}
                onPress={() => !readonly && onStatusChange(goal.id, nextStatus())}
                disabled={readonly}
            >
                {getStatusIcon()}
            </TouchableOpacity>

            <View style={styles.content}>
                <ThemedText type="defaultSemiBold" style={[
                    goal.status === 'done' && styles.completedText
                ]}>
                    {goal.title}
                </ThemedText>
                {goal.description && (
                    <ThemedText style={styles.description} numberOfLines={2}>
                        {goal.description}
                    </ThemedText>
                )}
            </View>

            <View style={styles.actions}>
                {showRollover && onRollover && (
                    <TouchableOpacity style={styles.actionButton} onPress={() => onRollover(goal.id)}>
                        <ArrowRight size={20} color={theme.tint} />
                    </TouchableOpacity>
                )}
                {!readonly && (
                    <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(goal.id)}>
                        <Trash2 size={20} color={theme.danger} />
                    </TouchableOpacity>
                )}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statusButton: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    description: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 2,
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 4,
    },
    disabledButton: {
        opacity: 0.4,
    },
});
