/*
 * Scout role
 */

module.exports = {
    run : run
};

function canNavigateTo(creep, target)
{
    var targetPath = creep.pos.findPathTo(target);
    var targetPos = creep.room.getPositionAt(targetPath[targetPath.length-1].x, targetPath[targetPath.length-1].y);
    return (targetPos.inRangeTo(target.pos, 1));
}

function leave(creep, room)
{
    var exits = Game.map.describeExits(room);
    for(i = 0; i < exits.length; ++i)
    {
        /*
        if(exits[i])
        {

        }
        */
    }
}

function run(creep)
{
    if(creep.memory.targetLocation != undefined)
    {
        if(canNavigateTo(creep, targetLocation))
        {
            creep.moveTo(targetLocation);
        }
        else
        {
            creep.say("No path!");
            creep.memory.targetLocation = undefined;
        }
    }
    else
    {
        if(Game.rooms.indexOf(creep.room) >= 0)
        {
            leave(creep, creep.room);
        }
    }
}