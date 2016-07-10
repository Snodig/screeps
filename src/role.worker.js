/*
 * Worker role
 */

module.exports = {
    run : run
};

var roleHarvester = require('role.harvester');

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
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if(targets.length)
        {
            if(creep.build(targets[0]) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(targets[0]);
            }
            return;
        }

        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
        {
            creep.moveTo(creep.room.controller);
            return;
        }

        var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });

        if(closestDamagedStructure)
        {
            creep.moveTo(closestDamagedStructure);
            creep.repair(closestDamagedStructure);
            return;
        }

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