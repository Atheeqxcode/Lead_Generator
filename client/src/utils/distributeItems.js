// src/utils/distributeItems.js

/**
 * Distributes a list of items evenly among a specified number of agents.
 * This logic mirrors the backend algorithm for client-side previews or tests.
 *
 * @param {Array<any>} items - The array of items to be distributed.
 * @param {number} agentsCount - The number of agents to distribute items among.
 * @returns {Array<Array<any>>} - An array of arrays, where each inner array represents the items assigned to an agent.
 */
export function distributeItems(items, agentsCount = 5) {
  if (!items || items.length === 0 || agentsCount <= 0) {
    return [];
  }

  const totalItems = items.length;
  
  // Calculate the base number of items each agent will receive.
  const baseDistribution = Math.floor(totalItems / agentsCount);
  
  // Calculate the number of agents who will receive an extra item.
  const remainder = totalItems % agentsCount;

  // Create the distribution array, which will hold the items for each agent.
  const distribution = Array.from({ length: agentsCount }, () => []);
  
  let currentItemIndex = 0;

  for (let i = 0; i < agentsCount; i++) {
    // Determine how many items this agent should get.
    // The first 'remainder' agents get one extra item.
    const itemsToAssign = baseDistribution + (i < remainder ? 1 : 0);
    
    // Slice the items from the main array and add them to the agent's list.
    const assignedItems = items.slice(currentItemIndex, currentItemIndex + itemsToAssign);
    distribution[i] = assignedItems;
    
    // Move the index for the next agent.
    currentItemIndex += itemsToAssign;
  }

  return distribution;
}
