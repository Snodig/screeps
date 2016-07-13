/*
 * Worker role
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
    var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < (structure.hitsMax * 0.75)
    });

    if(closestDamagedStructure)
    {
      if(creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE)
      {
        creep.moveTo(closestDamagedStructure);
      }
      return;
    }

    var target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
    if(target)
    {
      creep.moveTo(target);
      creep.build(target);
      return;
    }

    if(creep.room.controller.level < 5)
    {
      creep.moveTo(creep.room.controller);
      creep.upgradeController(creep.room.controller);
      return;
    }

    roleHarvester.deposit(creep);

    return;
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