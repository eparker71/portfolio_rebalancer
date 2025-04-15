import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Position {
  id: string;
  name: string;
  shares: number;
  price: number;
  targetWeight: number;
}

const PortfolioRebalancerApp = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [newPositionName, setNewPositionName] = useState('');
  const [newPositionShares, setNewPositionShares] = useState<number | string>('');
  const [newPositionPrice, setNewPositionPrice] = useState<number | string>('');
  const [newPositionTargetWeight, setNewPositionTargetWeight] = useState<number | string>('');

  const handleAddPosition = useCallback(() => {
    const sharesNum = Number(newPositionShares);
    const priceNum = Number(newPositionPrice);
    const weightNum = Number(newPositionTargetWeight);

    if (
      !newPositionName.trim() ||
      isNaN(sharesNum) ||
      isNaN(priceNum) ||
      isNaN(weightNum) ||
      sharesNum <= 0 ||
      priceNum <= 0 ||
      weightNum <= 0
    ) {
      alert('Please fill in all fields with valid values.'); // Basic validation
      return;
    }

    const newPosition: Position = {
      id: crypto.randomUUID(),
      name: newPositionName,
      shares: sharesNum,
      price: priceNum,
      targetWeight: weightNum,
    };
    setPositions([...positions, newPosition]);
    setNewPositionName('');
    setNewPositionShares('');
    setNewPositionPrice('');
    setNewPositionTargetWeight('');
  }, [
    newPositionName,
    newPositionShares,
    newPositionPrice,
    newPositionTargetWeight,
    positions,
  ]);

  const handleUpdatePosition = useCallback(
    (id: string, updates: Partial<Omit<Position, 'id'>>) => {
      setPositions(
        positions.map((position) =>
          position.id === id ? { ...position, ...updates } : position
        )
      );
    },
    [positions]
  );

  const handleDeletePosition = useCallback(
    (id: string) => {
      setPositions(positions.filter((position) => position.id !== id));
    },
    [positions]
  );

  const calculateRebalancing = useCallback(() => {
    if (positions.length === 0) {
      return []; // Return empty array if no positions
    }
    const totalPortfolioValue = positions.reduce(
      (sum, position) => sum + position.shares * position.price,
      0
    );

    return positions.map((position) => {
      const currentPositionValue = position.shares * position.price;
      const targetPositionValue = totalPortfolioValue * (position.targetWeight / 100);
      const difference = targetPositionValue - currentPositionValue;
      const tradeQuantity = difference / position.price;

      return {
        ...position,
        currentValue: currentPositionValue,
        targetValue: targetPositionValue,
        difference: difference,
        tradeQuantity: tradeQuantity,
      };
    });
  }, [positions]);

  const rebalancingResults = calculateRebalancing();

  const totalTargetWeight = positions.reduce((sum, pos) => sum + pos.targetWeight, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Portfolio Rebalancer
        </h1>

        {/* Input for New Positions */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-lg border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Position</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <Input
              type="text"
              placeholder="Asset Name"
              value={newPositionName}
              onChange={(e) => setNewPositionName(e.target.value)}
              className="bg-black/20 text-white border-purple-500/30 placeholder:text-gray-400"
            />
            <Input
              type="number"
              placeholder="Shares"
              value={newPositionShares}
              onChange={(e) => setNewPositionShares(e.target.value)}
              className="bg-black/20 text-white border-purple-500/30 placeholder:text-gray-400"
            />
            <Input
              type="number"
              placeholder="Price"
              value={newPositionPrice}
              onChange={(e) => setNewPositionPrice(e.target.value)}
              className="bg-black/20 text-white border-purple-500/30 placeholder:text-gray-400"
            />
            <Input
              type="number"
              placeholder="Target Weight (%)"
              value={newPositionTargetWeight}
              onChange={(e) => setNewPositionTargetWeight(e.target.value)}
              className="bg-black/20 text-white border-purple-500/30 placeholder:text-gray-400"
            />
            <Button
              onClick={handleAddPosition}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </div>

        {/* Display Current Positions and Input/Edit */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-lg border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Current Positions</h2>
          {positions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Asset</TableHead>
                    <TableHead className="text-white">Shares</TableHead>
                    <TableHead className="text-white">Price</TableHead>
                    <TableHead className="text-white">Target Weight (%)</TableHead>
                    <TableHead className="text-white">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {positions.map((position) => (
                      <motion.tr
                        key={position.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TableCell className="font-medium text-gray-300">{position.name}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={position.shares}
                            onChange={(e) =>
                              handleUpdatePosition(position.id, {
                                shares: Number(e.target.value),
                              })
                            }
                            className="w-24 bg-black/20 text-white border-purple-500/30"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={position.price}
                            onChange={(e) =>
                              handleUpdatePosition(position.id, {
                                price: Number(e.target.value),
                              })
                            }
                            className="w-24 bg-black/20 text-white border-purple-500/30"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={position.targetWeight}
                            onChange={(e) =>
                              handleUpdatePosition(position.id, {
                                targetWeight: Number(e.target.value),
                              })
                            }
                            className="w-32 bg-black/20 text-white border-purple-500/30"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeletePosition(position.id)}
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-gray-400">No positions added yet.</p>
          )}
          {positions.length > 0 && totalTargetWeight !== 100 && (
            <p className="text-yellow-400 mt-2">
              Warning: Total target weight is {totalTargetWeight}%. It should equal 100%.
            </p>
          )}
        </div>

        {/* Rebalancing Recommendations */}
        {rebalancingResults && rebalancingResults.length > 0 && (
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-lg border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Rebalancing Recommendations</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Asset</TableHead>
                    <TableHead className="text-white">Current Value</TableHead>
                    <TableHead className="text-white">Target Value</TableHead>
                    <TableHead className="text-white">Difference</TableHead>
                    <TableHead className="text-white">Trade Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rebalancingResults.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-gray-300">{result.name}</TableCell>
                      <TableCell className="text-gray-300">
                        ${result.currentValue.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        ${result.targetValue.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'font-medium',
                          result.difference > 0 ? 'text-green-400' : 'text-red-400'
                        )}
                      >
                        ${result.difference.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'font-medium',
                          result.tradeQuantity > 0 ? 'text-green-400' : 'text-red-400'
                        )}
                      >
                        {result.tradeQuantity > 0
                          ? `Buy ${result.tradeQuantity.toFixed(2)}`
                          : `Sell ${Math.abs(result.tradeQuantity).toFixed(2)}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioRebalancerApp;

