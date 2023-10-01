from flask import Flask, jsonify, request
from git import Repo
from flask_cors import CORS
import difflib

app = Flask(__name__)
CORS(app)
repo = Repo('D:/git/read-it-later')


@app.route('/api/get-diff/<int:offset>/<int:count>', methods=['GET'])
def get_diff(offset, count):
    head = repo.head.commit
    commits = list(repo.iter_commits(all=True))
    commit = commits[1]
    diffs = head.diff(commit, create_patch=True, ignore_blank_lines=True, ignore_space_at_eol=True, diff_filter='cr')
    diff_list = []

    print(f"Total diffs available: {len(diffs)}")

    end = min(offset + count, len(diffs))

    for i in range(offset, end):
        old_content = ''
        new_content = ''

        if diffs[i].a_path in commit.tree:
            old_content = commit.tree[diffs[i].a_path].data_stream.read().decode()

        if diffs[i].a_path in head.tree:
            new_content = head.tree[diffs[i].a_path].data_stream.read().decode()

        # Only append if either old_content or new_content has some data
        if old_content or new_content:
            diff_data = {
                'name': head.message,
                'oldFileContent': old_content,
                'newFileContent': new_content,
                'hex': head.hexsha,
                'author': head.author.name,
                'file': diffs[i].a_path
            }
            diff_list.append(diff_data)
        else:
            print(f"Excluded diff path: {diffs[i].a_path}")

    print(f"Returned diffs: {len(diff_list)}")
    return jsonify(diff_list)


@app.route('/api/set-repo', methods=['POST'])
def set_repo_path():
    global repo
    repo_path = request.json.get('path', '')
    try:
        repo = Repo(repo_path)
        return jsonify({"message": "Repository path set successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/get-commits', methods=['GET'])
def get_commits():
    global repo
    if repo is None:
        return jsonify({"error": "Repository not set or invalid."}), 400
    try:
        commits = list(repo.iter_commits(all=True, max_count=50))

        commits_data = [{
            'message': commit.message,
            'hex': commit.hexsha
        } for commit in commits]
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify(commits_data)


@app.route('/api/get-diff-between/<string:base_sha>/<string:compare_sha>', methods=['GET'])
def get_diff_between(base_sha, compare_sha):
    offset = int(request.args.get('offset', 0))
    count = int(request.args.get('count', 10))

    if not base_sha or not compare_sha:
        return jsonify({"error": "Invalid commit SHAs provided."}), 400

    base_commit = repo.commit(base_sha)
    compare_commit = repo.commit(compare_sha)
    diffs = base_commit.diff(compare_commit, create_patch=True)

    end = min(offset + count, len(diffs))
    diff_list = []

    for i in range(offset, end):
        file_path = diffs[i].a_path or diffs[i].b_path
        diff_item = diffs[i].diff.decode('utf-8')  # Add decode here

        if diffs[i].a_path:
            old_content = base_commit.tree[diffs[i].a_path].data_stream.read().decode()
        else:
            old_content = ""
        if diffs[i].b_path:
            new_content = compare_commit.tree[diffs[i].b_path].data_stream.read().decode()
        else:
            new_content = ""

        if old_content == '' and new_content == '':
            continue

        added_lines = sum(1 for line in diff_item.split('\n') if line.startswith('+') and not line.startswith('+++'))
        deleted_lines = sum(1 for line in diff_item.split('\n') if line.startswith('-') and not line.startswith('---'))

        diff_data = {
            'name': base_commit.message,
            'oldFileContent': old_content,
            'newFileContent': new_content,
            'hex': base_commit.hexsha,
            'author': base_commit.author.name,
            'file': file_path,
            'addedLines': added_lines,
            'deletedLines': deleted_lines,
        }
        diff_list.append(diff_data)

    return jsonify(diff_list)




if __name__ == '__main__':
    app.run(debug=True)
