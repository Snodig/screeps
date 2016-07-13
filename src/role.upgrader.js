/*
 * Upgrader role
 */

module.exports = {
  run : run
};

var roleHarvester = require('role.harvester');
var utils = require('utils');

function run(creep)
{
  if(creep.memory.working && creep.carry.energy == 0)
  {
    creep.memory.working = false;
  }

  if(!creep.memory.working && creep.carry.energy == creep.carryCapacity)
  {
    creep.memory.working = true;
  }

  if(creep.memory.working)
  {
    creep.moveTo(creep.room.controller);
    creep.upgradeController(creep.room.controller);
  }
  else
  {
    creep.memory.currentSource = roleHarvester.findSource(creep);
    if(roleHarvester.mineSource(creep) == false)
    {
      if(creep.carry.energy > 0)
      {
        creep.memory.working = true;
      }
    }
  }
}