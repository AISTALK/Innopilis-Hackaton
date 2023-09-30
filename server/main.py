from flask import Flask, jsonify
from git import Repo
from flask_cors import CORS
app = Flask(__name__)
CORS(app)


@app.route('/api/get-diff/<int:index>', methods=['GET'])
def get_diff(index):
    repo = Repo('D:/git/vm_test')
    head = repo.head.commit
    commits = list(repo.iter_commits(all=True))
    commit = commits[1]
    diffs = head.diff(commit, create_patch=True, ignore_blank_lines=True, ignore_space_at_eol=True, diff_filter='cr')
    diff_list = []
    for i in range(0, index):
        if diffs[i].a_path in commit.tree and diffs[i].a_path in head.tree:
            old_content = commit.tree[diffs[i].a_path].data_stream.read().decode()
            new_content = head.tree[diffs[i].a_path].data_stream.read().decode()
            diff_data = {
                'name': head.message,
                'oldFileContent': old_content,
                'newFileContent': new_content,
                'hex': head.hexsha,
                'author': head.author.name,
                'file': diffs[i].a_path
            }
            diff_list.append(diff_data)
    return jsonify(diff_list)




if __name__ == '__main__':
    app.run(debug=True)
