/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.say('lol');
        if(creep.carry.energy < creep.carryCapacity)
        {
            creep.memory.currentSource = 0;
            var sources = creep.room.find(FIND_SOURCES);
            for(i = 0; i < sources.length; ++i)
            {
                let targetPath = creep.pos.findPathTo(sources[i]);
                let targetPos = creep.room.getPositionAt(targetPath[targetPath.length-1].x, targetPath[targetPath.length-1].y);
                if(targetPos.inRangeTo(sources[i].pos, 1))
                {
                    creep.memory.currentSource = sources[i].id;
                    break;
                }
                else
                {
                    continue;
                }
            }

            if(creep.memory.currentSource == 0)
            {
                var closest = creep.pos.findClosestByRange(FIND_SOURCES);
                if(creep.pos.getRangeTo(closest) > 3)
                {
                    creep.moveTo(closest);
                }
                else
                {
                    var spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS)
                    creep.moveTo(spawn);
                }
            }
            else
            {
                // Mine current source
                var source = Game.getObjectById(creep.memory.currentSource);
                console.log(creep.name + " using saved source: " + creep.memory.currentSource)

                let targetPath = creep.pos.findPathTo(source);
                let targetPos = creep.room.getPositionAt(targetPath[targetPath.length-1].x, targetPath[targetPath.length-1].y);
                if(targetPos.inRangeTo(source.pos, 1))
                {
                    let err = creep.moveTo(source);
                    creep.harvest(source);
                    if(err != OK)
                    {
                        creep.say(err);
                    }
                }
                else
                {
                    creep.say("No path");
                    creep.memory.currentSource = 0;
                }
            }
        }
        else // Reached capacity
        {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
            });

            if(targets.length > 0)
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
    }
};

module.exports = roleHarvester;