/*
 *  Controller for all construction-planning
 */

module.exports = {
  run : run,
  pleasePaveSwamp:pleasePaveSwamp
}

var utils = require('utils');

function buildAt(pos, type)
{
  let room = Game.rooms[pos.roomName];
  if(pos.lookFor(LOOK_CONSTRUCTION_SITES).length)
  {
    return ERR_INVALID_TARGET;
  }

  if(pos.lookFor(LOOK_STRUCTURES).length)
  {
    return ERR_INVALID_TARGET;
  }

  if(pos.lookFor(LOOK_TERRAIN) != 'wall')
  {
    let err = room.createConstructionSite(pos, type);
    if(err == OK)
    {
      console.log("Planning road segment at (" + pos.x + "," + pos.y + ")");
    }
    else if(err != ERR_FULL)
    {
      console.log("Controller could not create road: " + utils.errStr(err) + " at (" + pos.x + "," + pos.y + ")");
    }
    return err;
  }
}

function pleasePaveSwamp(pos)
{
  var room = Game.rooms[pos.roomName];
  if(pos.lookFor(LOOK_TERRAIN) == 'swamp')
  {
    buildAt(pos, STRUCTURE_ROAD);
  }
}

function pave3x3(pos)
{
  let room = Game.rooms[pos.roomName];
  let bound_top = pos.y-1;
  let bound_left = pos.x-1;
  let bound_bottom = pos.y+1;
  let bound_right = pos.x+1;

  if(room.lookForAtArea(LOOK_CONSTRUCTION_SITES, bound_top, bound_left, bound_bottom, bound_right).length)
  {
    return;
  }

  if(room.lookForAtArea(LOOK_STRUCTURES, bound_top, bound_left, bound_bottom, bound_right).length)
  {
    return;
  }

  let look = room.lookAtArea(bound_top, bound_left, bound_bottom, bound_right);

  //Todo: This look awfully ugly
  for(let y in look)
  {
    for(let x in look[y])
    {
      let road_pos = room.getPositionAt(x, y);
      if(buildAt(road_pos, STRUCTURE_ROAD) == ERR_FULL)
      {
        return;
      }
    }
  }
}

function pave5x5(pos)
{
  let room = Game.rooms[pos.roomName];
  let bound_top = pos.y-2;
  let bound_left = pos.x-2;
  let bound_bottom = pos.y+2;
  let bound_right = pos.x+2;

  if(room.lookForAtArea(LOOK_CONSTRUCTION_SITES, bound_top, bound_left, bound_bottom, bound_right).length)
  {
    return;
  }

  if(room.lookForAtArea(LOOK_STRUCTURES, bound_top, bound_left, bound_bottom, bound_right).length)
  {
    return;
  }

  let look = room.lookAtArea(bound_top, bound_left, bound_bottom, bound_right);

  //Todo: This look awfully ugly
  for(let y in look)
  {
    for(let x in look[y])
    {
      let road_pos = room.getPositionAt(x, y);
      if(buildAt(road_pos, STRUCTURE_ROAD) == ERR_FULL)
      {
        return;
      }
    }
  }
}

//Todo: Consider paving 2x2
function paveFromTo(from, target)
{
  let goal = {pos:target.pos, range:1};

  let ret = PathFinder.search( from.pos, goal, {
    // We need to set the defaults costs higher so that we
    // can set the road cost lower in `roomCallback`
    plainCost: 2,
    swampCost: 10,
    roomCallback: function(roomName)
    {
      // In this example `room` will always exist, but since PathFinder
      // supports searches which span multiple rooms you should be careful!
      let room = Game.rooms[from.pos.roomName];
      if (!room) return;
      let costs = new PathFinder.CostMatrix;

      room.find(FIND_STRUCTURES).forEach(
      function(structure)
      {
        if (structure.structureType === STRUCTURE_ROAD)
        {
        // Favor roads over plain tiles
        //costs.set(structure.pos.x, structure.pos.y, 1);
        } else if (
        structure.structureType !== STRUCTURE_CONTAINER &&
         (structure.structureType !== STRUCTURE_RAMPART || !structure.my))
        {
        // Can't walk through non-walkable buildings
        costs.set(structure.pos.x, structure.pos.y, 0xff);
        }
      }); //forEach

      return costs;
    }, //roomCallback
  }); //search

  for(i = 0; i < ret.path.length; ++i)
  {
    let road_pos = ret.path[i];
    if(buildAt(road_pos, STRUCTURE_ROAD) == ERR_FULL)
    {
      return;
    }
  }
}

function paveFromToMany(from, targets)
{
  for(let i = 0; i < targets.length; ++i)
  {
    paveFromTo(from, targets[i]);
  }
}

function planRoads(room)
{
  var sources = room.find(FIND_SOURCES);
  var spawns = room.find(FIND_MY_SPAWNS);

  for(let i = 0; i < spawns.length; ++i)
  {
    paveFromToMany(spawns[i], sources);
    paveFromTo(spawns[i], room.controller);
  }

  for(let i = 0; i < sources.length; ++i)
  {
    paveFromToMany(sources[i], spawns);
    pave5x5(sources[i].pos);
    // Maybe pave 3x3 and pave any spot where a harvester is mining within 5x5 of sources
  }

  pave5x5(room.controller.pos);
}

function planExtensions(room)
{
  if(room.controller.level > 1)
  {
    room.find(FIND_MY_SPAWNS).forEach(
    function(spawn)
    {
      let controllerLevelFactor = Math.round(room.controller.level * 0.5);
      let pos = spawn.pos;
      let bound_top = (pos.y) - controllerLevelFactor;
      let bound_left = (pos.x) - controllerLevelFactor;
      let bound_bottom = (pos.y) + controllerLevelFactor;
      let bound_right = (pos.x) + controllerLevelFactor;

      let look = room.lookAtArea(bound_top, bound_left, bound_bottom, bound_right);
      for(let y in look)
      {
        for(let x in look[y])
        {
          let look_pos = look[y][x][0];
          if(look_pos.type == "terrain")
          {
            if(look_pos.terrain != "wall")
            {;
              let extensions_pos = room.getPositionAt(x, y);
              let err = room.createConstructionSite(extensions_pos, STRUCTURE_EXTENSION);
              if(err)
              {
                if(err != ERR_RCL_NOT_ENOUGH) //Todo: Handle this better
                {
                  console.log("Controller could not create extension: " + utils.errStr(err) + " at (" + extensions_pos.x + "," + extensions_pos.y + ")");
                }
              }
              else
              {
                console.log("Planning extension at (" + extensions_pos.x + "," + extensions_pos.y + ")");
              }
            }
          }
        }
      }
    });
  }
}

function run(room)
{
  if(Game.time % 30 == 0)
  {
    planRoads(room);
    planExtensions(room);
  }
}