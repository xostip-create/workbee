'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { UserAccount } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { format, subDays } from 'date-fns';
import { Loader2 } from 'lucide-react';


function UserAnalytics() {
    const firestore = useFirestore();

    const allUsersQuery = useMemoFirebase(() => collection(firestore, 'userAccounts'), [firestore]);
    const { data: allUsers, isLoading: isLoadingUsers } = useCollection<UserAccount>(allUsersQuery);

    const userChartData = useMemo(() => {
        if (!allUsers) return [];

        const signupsByDay: { [key: string]: number } = {};
        const today = new Date();
        // Go back 30 days
        for (let i = 0; i < 30; i++) {
            const date = subDays(today, i);
            const formattedDate = format(date, 'MMM d');
            signupsByDay[formattedDate] = 0;
        }

        allUsers.forEach(user => {
            if (user.createdAt) {
                const signupDate = new Date(user.createdAt);
                // Only include signups in the last 30 days
                if (signupDate >= subDays(today, 30)) {
                    const formattedDate = format(signupDate, 'MMM d');
                    if (signupsByDay[formattedDate] !== undefined) {
                         signupsByDay[formattedDate]++;
                    }
                }
            }
        });
        
        return Object.entries(signupsByDay)
            .map(([date, count]) => ({ date, signups: count }))
            .reverse(); // To show oldest to newest

    }, [allUsers]);

    const chartConfig = {
        signups: {
            label: "Signups",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;


    if (isLoadingUsers) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>User Analytics</CardTitle>
                    <CardDescription>Recent user signup trends.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Analytics</CardTitle>
                <CardDescription>User signups in the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={userChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            stroke="#888888"
                        />
                        <YAxis allowDecimals={false} stroke="#888888" />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Analytics</h1>
                <p className="text-muted-foreground">Explore user growth and trends.</p>
            </div>
            <UserAnalytics />
        </div>
    )
}
