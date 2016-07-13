/*
 * Todo:
    * Automate spawn-placement (point with best fitness from all sources) - will probably not be possible for first spawn
    * Controller for mining
    * Mine-drop-pickup cycle? -> Low move, no-carry miners
    * Controller for towers/defence
    * Optimize construction (CPU)
    * Automate wall/rampart-construction
    * Expand (scout-role)
    * Defence-role
    * Mine minerals + labs?
    * Refactor creep-spawning + controller
 */

var roleHarvester = require('role.harvester');
var roleWorker = require('role.worker');
var roleUpgrader = require('role.upgrader');
var controllerConstruction = require('controller.construction');
var utils = require('utils');

function cleanupMemory()
{
  for(var name in Memory.creeps)
  {
    if(!Game.creeps[name])
    {
      delete Memory.creeps[name];
      console.log('Died:', name);
    }
  }
}

function updateTowers(room)
{
  var towers = room.find(FIND_MY_STRUCTURES, {
    filter: (structure) => structure.structureType == STRUCTURE_TOWER
  });

  towers.forEach(
  function(tower)
  {
    //Todo: Target healers, then ranged units, then melee units
    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if(closestHostile)
    {
      // 600 hits at range ≤5 to 150 hits at range ≥20
      tower.attack(closestHostile);
    }

    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < (structure.hitsMax - 800) // Avoid chip-repairing everything
    });

    if(closestDamagedStructure)
    {
      // 800 hits at range ≤5 to 200 hits at range ≥20
      // 800h:10e (creeps repair for 100h:1e)
      tower.repair(closestDamagedStructure);
    }

    // Heals: 400 hits at range ≤5 to 100 hits at range ≥20
  });
}

const HARVESTER_LIMIT = 5;
const UPGRADER_LIMIT = 5;
const WORKER_LIMIT = 15;

module.exports.loop = function ()
{
  console.log("Tick: " + Game.time);

  cleanupMemory();

  if(!Game.spawns.Spawn1)
  {
    return;
  }

  if(!Memory.PREV_CTRL_LEVEL)
  {
    Memory.PREV_CTRL_LEVEL = 1;
  }

  var spawnRoom = Game.spawns.Spawn1.room;

  if(spawnRoom.controller.level > Memory.PREV_CTRL_LEVEL)
  {
    console.log("Controller in room '" + spawnRoom.name + "' has reached level " + spawnRoom.controller.level + ".");
    Game.notify("Controller in room '" + spawnRoom.name + "' has reached level " + spawnRoom.controller.level + ".");

    for(var name in Game.creeps)
    {
      Game.creeps[name].say('Hooray!');
    }

    Memory.PREV_CTRL_LEVEL = spawnRoom.controller.level;
  }

  updateTowers(spawnRoom);

  for(var name in Game.creeps)
  {
    var creep = Game.creeps[name];
    if(creep.memory.role == 'harvester')
    {
      roleHarvester.run(creep);
    }
    if(creep.memory.role == 'worker')
    {
      roleWorker.run(creep);
    }
    if(creep.memory.role == 'upgrader')
    {
      roleUpgrader.run(creep);
    }
  }

  controllerConstruction.run(Game.spawns.Spawn1.room);

  var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  var workers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker');

  if(Game.spawns.Spawn1.spawning == null)
  {
    if(harvesters.length < HARVESTER_LIMIT)
    {
      var newName = undefined;

      if(harvesters.length > HARVESTER_LIMIT*0.75)
      {
        newName = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'harvester'});
      }
      else if(harvesters.length > HARVESTER_LIMIT*0.5)
      {
        newName = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'harvester'});
      }
      else
      {
        newName = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE], undefined, {role: 'harvester'});
      }

      if(newName != ERR_NOT_ENOUGH_ENERGY)
      {
        console.log('Spawning new harvester: ' + newName + ", " + JSON.stringify(Game.creeps[newName]));
        return;
      }
    }

    if(upgraders.length < UPGRADER_LIMIT)
    {
      var newName = undefined;

      if(upgraders.length > UPGRADER_LIMIT*0.75)
      {
        newName = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'upgrader'});
      }
      else if(upgraders.length > UPGRADER_LIMIT*0.5)
      {
        newName = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'upgrader'});
      }
      else
      {
        newName = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
      }

      if(newName != ERR_NOT_ENOUGH_ENERGY)
      {
        console.log('Spawning new upgrader: ' + newName + ", " + JSON.stringify(Game.creeps[newName]));
        return;
      }
    }

    if(workers.length < WORKER_LIMIT)
    {
      var newName = undefined;

      if(workers.length > WORKER_LIMIT*0.75)
      {
        newName = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'worker'});
      }
      else if(workers.length > WORKER_LIMIT*0.5)
      {
        newName = Game.spawns.Spawn1.createCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], undefined, {role: 'worker'});
      }
      else
      {
        newName = Game.spawns.Spawn1.createCreep([WORK,CARRY,MOVE], undefined, {role: 'worker'});
      }

      if(newName != ERR_NOT_ENOUGH_ENERGY)
      {
        console.log('Spawning new worker: ' + newName + ", " + JSON.stringify(Game.creeps[newName]));
        return;
      }
    }
  }
}