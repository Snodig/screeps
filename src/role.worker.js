/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.worker');
 * mod.thing == 'a thing'; // true
 */

var roleWorker = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
        }

        if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
        }

        if(creep.memory.working)
        {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length)
            {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
                return;
            }

            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
                return;
            }

            var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                creep.moveTo(closestDamagedStructure);
                creep.repair(closestDamagedStructure);
                return;
            }

            return;
        }
        // Todo: Define a controller that can be asked to return a source with a free spot to mine
        else {
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
    }
};

module.exports = roleWorker;