from git import Repo
repo = Repo('D:/git/vm_test')
head = repo.head.commit
commits = list(repo.iter_commits(all=True))
commit = commits[1]

target_commit = commits[1]
diffs = repo.git.diff(commit)
print(diffs)



