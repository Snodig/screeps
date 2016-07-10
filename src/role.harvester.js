/*
 * Harvester role and functions
 */

module.exports = {
    run : run,
    deposit:deposit,
    findSource:findSource,
    mineSource:mineSource
};

/** @param {Creep} creep **/
function findSource(creep)
{
    var sources = creep.room.find(FIND_SOURCES);
    for(i = 0; i < sources.length; ++i)
    {
        let targetPath = creep.pos.findPathTo(sources[i]);
        let targetPos = creep.room.getPositionAt(targetPath[targetPath.length-1].x, targetPath[targetPath.length-1].y);
        if(targetPos.inRangeTo(sources[i].pos, 1))
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

/** @param {Creep} creep **/
function mineSource(creep)
{
    if(creep.memory.currentSource != 0)
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
            return false;
        }

        return true;
    }
    else
    {
        // No available source found, hover around the closest source
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

        return false;
    }
}

/** @param {Creep} creep **/
function deposit(creep)
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

/** @param {Creep} creep **/
function run(creep)
{
    if(creep.carry.energy < creep.carryCapacity)
    {
        creep.memory.currentSource = findSource(creep);
        mineSource(creep);
    }
    else // Reached capacity
    {
        deposit(creep);
    }
}