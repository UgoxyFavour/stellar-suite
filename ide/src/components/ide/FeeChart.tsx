"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { NetworkKey } from "@/lib/networkConfig";
import { FeeDataService, LedgerFeeData, FeeRecommendation } from "@/lib/feeDataService";

interface FeeChartProps {
  network: NetworkKey;
  className?: string;
}

export function FeeChart({ network, className }: FeeChartProps) {
  const [feeHistory, setFeeHistory] = useState<LedgerFeeData[]>([]);
  const [recommendations, setRecommendations] = useState<FeeRecommendation>({ low: 100, average: 100, high: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const feeService = FeeDataService.getInstance();
        const history = await feeService.getFeeHistory(network, 100);
        const recs = feeService.calculateFeeRecommendations(history);
        
        setFeeHistory(history);
        setRecommendations(recs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load fee data");
      } finally {
        setLoading(false);
      }
    };

    loadFeeData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadFeeData, 30000);
    return () => clearInterval(interval);
  }, [network]);

  const chartData = feeHistory.map(ledger => ({
    ledger: ledger.sequence,
    fee: ledger.base_fee || 0,
    operations: ledger.operation_count
  }));

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-48 ${className}`}>
        <div className="text-xs text-muted-foreground">Loading fee data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-48 ${className}`}>
        <div className="text-xs text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Fee Market Trends (Last 100 Ledgers)</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Low: {recommendations.low} stroops</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Average: {recommendations.average} stroops</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High: {recommendations.high} stroops</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="ledger" 
            stroke="#9ca3af"
            fontSize={10}
            tickFormatter={(value) => `${value % 1000}`}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={10}
            tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value.toString()}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #374151",
              borderRadius: "6px",
              fontSize: "11px"
            }}
            labelFormatter={(value) => `Ledger #${value}`}
            formatter={(value: any, name: string) => [
              name === "fee" ? `${value} stroops` : value,
              name === "fee" ? "Base Fee" : "Operations"
            ]}
          />
          <Line
            type="monotone"
            dataKey="fee"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="fee"
          />
          <ReferenceLine
            y={recommendations.low}
            stroke="#10b981"
            strokeDasharray="5 5"
            strokeWidth={1}
            label={{ value: "Low", position: "left", fontSize: 10, fill: "#10b981" }}
          />
          <ReferenceLine
            y={recommendations.average}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            strokeWidth={1}
            label={{ value: "Average", position: "left", fontSize: 10, fill: "#f59e0b" }}
          />
          <ReferenceLine
            y={recommendations.high}
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={1}
            label={{ value: "High", position: "left", fontSize: 10, fill: "#ef4444" }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-2 text-xs text-muted-foreground">
        Current base fee recommendations based on recent network activity
      </div>
    </div>
  );
}
