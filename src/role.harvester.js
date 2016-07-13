/*
 * Harvester role and generic functions
 */

module.exports = {
  run : run,
  deposit:deposit,
  findSource:findSource,
  mineSource:mineSource
};

var utils = require('utils');
var controllerConstruction = require('controller.construction');

function canNavigateTo(creep, target)
{
  var targetPath = creep.pos.findPathTo(target, {maxOps:200, maxRooms:1});
  if(!targetPath || targetPath.length == 0)
  {
    return false;
  }
  var targetPos = creep.room.getPositionAt(targetPath[targetPath.length-1].x, targetPath[targetPath.length-1].y);
  return (targetPos.inRangeTo(target.pos, 1));
}

function findSource(creep)
{
  var closest = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
  if(canNavigateTo(creep, closest))
  {
    return creep.memory.currentSource = closest.id;
  }

  var sources = creep.room.find(FIND_SOURCES);
  for(i = 0; i < sources.length; ++i)
  {
    if(canNavigateTo(creep, sources[i]))
    {
      return creep.memory.currentSource = sources[i].id;
    }
    else
    {
      continue;
    }
  }

  return 0;
}

function findMineral(creep)
{
  var minerals = creep.room.find(FIND_MINERALS);
  for(i = 0; i < minerals.length; ++i)
  {
    if(canNavigateTo(creep, minerals[i]))
    {
      return creep.memory.currentSource = minerals[i].id;
    }
    else
    {
      continue;
    }
  }

  return 0;
}

function findExtractor(creep)
{
  var extractors = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => structure.structureType == STRUCTURE_EXTRACTOR
  });
  for(i = 0; i < extractors.length; ++i)
  {
    if(canNavigateTo(creep, extractors[i]))
    {
      return creep.memory.currentSource = extractors[i].id;
    }
    else
    {
      continue;
    }
  }

  return 0;
}

function mineSource(creep)
{
  if(creep.memory.currentSource != 0)
  {
    // Mine current source
    var source = Game.getObjectById(creep.memory.currentSource);

    if(creep.harvest(source) == ERR_NOT_IN_RANGE)
    {
      if(canNavigateTo(creep, source))
      {
        let err = creep.moveTo(source);
        if(err == ERR_TIRED)
        {
          controllerConstruction.pleasePaveSwamp(creep.pos);
        }
        else if(err != OK)
        {
          creep.say(utils.errStr(err));
        }
      }
      else
      {
        creep.say("No path");
        creep.memory.currentSource = 0;
        return false;
      }
    }

    return true;
  }
  else
  {
    // No available source found, hover around the closest source
    var closest = creep.pos.findClosestByRange(FIND_SOURCES);
    if(creep.pos.getRangeTo(closest) > 1)
    {
      creep.moveTo(closest);
    }
    else
    {
      var spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
      creep.moveTo(spawn);
    }

    return false;
  }
}

function deposit(creep)
{
  var targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_TOWER)
             && structure.energy < structure.energyCapacity;
      }
  });

  if(!targets.length)
  {
      targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType  == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN)
                 && structure.energy < structure.energyCapacity;
          }
      });
  }

  if(targets.length)
  {
    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
    {
      creep.moveTo(targets[0]);
    }
  }
  else
  {
    creep.say("Idle")

    var spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
    creep.moveTo(spawn);
  }
}

// Idea: Mine and drop to ground, have others pick up

function run(creep)
{
  if(creep.carry.energy < creep.carryCapacity)
  {
    creep.memory.currentSource = findExtractor(creep);
    if(creep.memory.currentSource == 0)
    {
      creep.memory.currentSource = findSource(creep);
    }
    mineSource(creep);
  }
  else // Reached capacity
  {
    deposit(creep);
  }
}