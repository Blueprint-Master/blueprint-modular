"""Exercise team assignment and audit against the disposable installed application."""
import json
import os
import secrets
import subprocess
from uuid import uuid4


def seed_team(app, node_env, owner_email):
    member_email = "member-" + secrets.token_hex(6) + "@example.test"
    from pathlib import Path
    env = dict(node_env, MODULAR_QA_EMAIL=member_email)
    seed = Path(__file__).with_name("seed-module-install-fixture.cjs").resolve()
    subprocess.run(["node", str(seed), str(app)], cwd=app, env=env, check=True)
    query = """
const db=new(require('@prisma/client').PrismaClient)();
(async () => {
 const owner=await db.user.findUniqueOrThrow({where:{email:process.env.QA_OWNER}});
 const member=await db.user.findUniqueOrThrow({where:{email:process.env.MODULAR_QA_EMAIL}});
 const org=await db.organization.create({data:{name:'Équipe de recette',slug:process.env.QA_SLUG,
   members:{create:[{userId:owner.id,role:'owner'},{userId:member.id,role:'member'}]}}});
 console.log(JSON.stringify({organization:org.id,member:member.id}));
})().finally(()=>db.$disconnect());
"""
    result = subprocess.check_output(["node", "-e", query], cwd=app, env=dict(env, QA_OWNER=owner_email, QA_SLUG=uuid4().hex))
    return {**json.loads(result), "email": member_email}


def open_task(http, origin, team):
    endpoint = origin + "/api/team-tasks/" + team["organization"]
    task = {"id": str(uuid4()), "title": "Réceptionner un lot", "due": "2026-12-01",
            "priority": "high", "assigneeId": team["member"]}
    assert http.post(endpoint, json=task).status_code == 201
    assert http.post(endpoint, json=task).status_code == 200
    assert http.post(endpoint, json={**task, "title": "Autre lot"}).status_code == 409
    assert http.post(endpoint, json={**task, "id": str(uuid4()), "assigneeId": "outsider"}).status_code == 400
    assert http.get(origin + "/api/team-tasks/other-team").status_code == 403
    return task["id"]


def finish_task(http, origin, team, task_id):
    endpoint = origin + "/api/team-tasks/" + team["organization"]
    assert len(http.get(endpoint).json()["tasks"]) == 1
    notifications = http.get(origin + "/api/notifications").json()["notifications"]
    assert sum(n["message"] == "Réceptionner un lot" for n in notifications) == 1
    assert http.patch(endpoint, json={"action": "remove", "id": task_id, "revision": 1}).status_code == 403
    assert http.patch(endpoint, json={"action": "advance", "id": task_id, "revision": 1}).status_code == 204
    assert http.patch(endpoint, json={"action": "advance", "id": task_id, "revision": 1}).status_code == 409
    assert http.patch(endpoint, json={"action": "advance", "id": task_id, "revision": 2}).status_code == 204
    assert http.get(endpoint).json()["tasks"][0]["status"] == "done"


def check_audit(http, origin, team, task_id):
    endpoint = origin + "/api/team-tasks/" + team["organization"]
    assert http.patch(endpoint, json={"action": "remove", "id": task_id, "revision": 3}).status_code == 204
    assert not http.get(endpoint).json()["tasks"]
    events = http.get(endpoint, params={"history": task_id}).json()["events"]
    assert [e["action"] for e in events] == ["create", "advance", "advance", "remove"]
    audit = http.get(endpoint, params={"audit": "1"}).json()
    assert [e["revision"] for e in audit["events"]] == [4, 3, 2, 1]
    assert audit["before"] is None


def clear_team(app, node_env, team):
    query = """
const db=new(require('@prisma/client').PrismaClient)();
db.$transaction([db.organization.delete({where:{id:process.env.QA_ORG}}),
  db.user.delete({where:{email:process.env.QA_MEMBER}})]).finally(()=>db.$disconnect());
"""
    subprocess.run(["node", "-e", query], cwd=app, env=dict(node_env, QA_ORG=team["organization"], QA_MEMBER=team["email"]), check=True)
